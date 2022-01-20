//Requires access to the TIX API and the 4S Mkt Data API

let fracL = 0.1; //Fraction of assets to keep as cash in hand
let fracH = 0.2;
let commission = 100000; //Buy or sell commission
let numCycles = 2; //Each cycle is 5 seconds
let desiredExpRet = 0.0004; // Desired expected return on investments

/** @param {NS} ns **/
function refresh(ns, stocks, myStocks, buyStocks) {
  let corpus = ns.getServerMoneyAvailable('home');
  myStocks.length = 0;
  buyStocks.length = 0;

  for (let i = 0; i < stocks.length; i++) {
    let sym = stocks[i].sym;
    stocks[i].price = ns.stock.getPrice(sym);
    stocks[i].shares = ns.stock.getPosition(sym)[0];
    stocks[i].buyPrice = ns.stock.getPosition(sym)[1];
    stocks[i].vol = ns.stock.getVolatility(sym);
    stocks[i].prob = 2 * (ns.stock.getForecast(sym) - 0.5);
    stocks[i].expRet = (stocks[i].vol * stocks[i].prob) / 2;

    corpus += stocks[i].price * stocks[i].shares;
    // ns.print ('Expected Return (' + stocks[i].sym + '): '+stocks[i].expRet)
    if (stocks[i].shares > 0) {
      myStocks.push(stocks[i]);
    }

    if (
      stocks[i].shares != ns.stock.getMaxShares(sym) &&
      stocks[i].expRet > desiredExpRet
    ) {
      buyStocks.push(stocks[i]);
    }
  }

  stocks.sort(function (a, b) {
    return b.expRet - a.expRet;
  });
  buyStocks.sort(function (a, b) {
    return b.expRet - a.expRet;
  });
  return corpus;
}

/** @param {NS} ns **/
function buy(ns, stock, numShares) {
  let boughtPrice = ns.stock.buy(stock.sym, numShares);
  if (boughtPrice > 0) {
    ns.print(`Bought ${stock.sym} for ${format(numShares * boughtPrice)}`);
    //ns.print('Expected Return (' + stock.sym + '): ' + stock.expRet);
  }
}

/** @param {NS} ns **/
function sell(ns, stock, numShares) {
  let profit = numShares * (stock.price - stock.buyPrice) - 2 * commission;
  let soldPrice = ns.stock.sell(stock.sym, numShares);
  ns.print(
    `Sold ${stock.sym} for profit of ${format(profit)} at ${
      Math.round(soldPrice * 100) / 100
    }`,
  );
}

/** @param {NS} ns **/
function format(num) {
  let symbols = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc'];
  let dollarPrefix = Math.sign(num) < 0 ? '-$' : '$';

  num = Math.abs(num);
  let i = 0;
  for (; num >= 1000 && i < symbols.length; i++) {
    num /= 1000;
  }

  return dollarPrefix + num.toFixed(3) + symbols[i];
}

/** @param {NS} ns **/
export async function main(ns) {
  //Initialise
  ns.disableLog('ALL');
  let stocks = [];
  let myStocks = [];
  let buyStocks = [];
  let corpus = 0;

  for (let i = 0; i < ns.stock.getSymbols().length; i++) {
    stocks.push({ sym: ns.stock.getSymbols()[i] });
  }

  while (true) {
    myStocks = [];
    buyStocks = [];
    corpus = refresh(ns, stocks, myStocks, buyStocks);

    //Sell underperforming shares
    for (let i = 0; i < myStocks.length; i++) {
      // if (stocks[0].expRet > myStocks[i].expRet) {
      if (myStocks[i].expRet < desiredExpRet) {
        sell(ns, myStocks[i], myStocks[i].shares);
        corpus -= commission;
      }
    }

    //Sell shares if not enough cash in hand
    for (let i = 0; i < myStocks.length; i++) {
      if (ns.getServerMoneyAvailable('home') < fracL * corpus) {
        let cashNeeded =
          corpus * fracH - ns.getServerMoneyAvailable('home') + commission;
        let numShares = Math.floor(cashNeeded / myStocks[i].price);
        sell(ns, myStocks[i], numShares);
        corpus -= commission;
      }
    }

    //Buy shares with cash remaining in hand
    if (buyStocks.length > 0) {
      let cashToSpend = ns.getServerMoneyAvailable('home') - fracH * corpus;
      let numShares = Math.floor(
        (cashToSpend - commission) / buyStocks[0].price,
      );

      if (numShares > ns.stock.getMaxShares(buyStocks[0].sym)) {
        numShares = ns.stock.getMaxShares(buyStocks[0].sym);
      }

      if (
        numShares * buyStocks[0].expRet * buyStocks[0].price * numCycles >
        commission
      ) {
        buy(ns, buyStocks[0], numShares);
      }
    } else {
      ns.print(
        'There are currently no stocks to buy at the desired expRet of ' +
          desiredExpRet,
      );
    }

    //Pause at end of loop
    await ns.sleep(5 * 1000 * numCycles + 200);
  }
}
