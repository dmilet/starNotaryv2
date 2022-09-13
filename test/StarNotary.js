const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets owner put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let owner = accounts[0];
    let tokenId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', tokenId, {from: owner});
    await instance.putStarUpForSale(tokenId, starPrice, {from: owner});
    assert.equal(await instance.starsForSale.call(tokenId), starPrice);
}).timeout(20000);

it('lets seller get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let seller = accounts[1];
    let buyer = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: seller});
    await instance.putStarUpForSale(starId, starPrice, {from: seller});
    await instance.approveBuyer(starId, buyer, {from: seller});
    let balanceOfsellerBeforeTransaction = await web3.eth.getBalance(seller);
    console.log("balanceOfsellerBeforeTransaction = " + balanceOfsellerBeforeTransaction);
    await instance.buyStar(starId, {from: buyer, value: balance});
    let balanceOfsellerAfterTransaction = await web3.eth.getBalance(seller);
    console.log("balanceOfsellerAfterTransaction = " + balanceOfsellerAfterTransaction);
    console.log("starPrice = " + starPrice);
    console.log("balance = " + balance);
    let value1 = Number(balanceOfsellerBeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfsellerAfterTransaction);
    assert.equal(value1, value2);
}).timeout(20000);

it('Verify that the buyer is the new owner after buying star', async() => {
    let instance = await StarNotary.deployed();
    let seller = accounts[1];
    let buyer = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: seller});
    await instance.putStarUpForSale(starId, starPrice, {from: seller});
    await instance.approveBuyer(starId, buyer, {from: seller});
    await instance.buyStar(starId, {from: buyer, value: balance, gasPrice:0});
    assert.equal(await instance.ownerOf.call(starId), buyer);
}).timeout(20000);

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let seller = accounts[1];
    let buyer = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: seller});
    await instance.putStarUpForSale(starId, starPrice, {from: seller});
    await instance.approveBuyer(starId, buyer, {from: seller});
    const balanceOfbuyerBeforeTransaction = await web3.eth.getBalance(buyer);
    await instance.buyStar(starId, {from: buyer, value: balance, gasPrice:0});
    const balanceAfterbuyerBuysStar = await web3.eth.getBalance(buyer);
    console.log("balanceOfbuyerBeforeTransaction = " + balanceOfbuyerBeforeTransaction/1000000000);
    console.log("balanceAfterbuyerBuysStar = " + balanceAfterbuyerBuysStar/1000000000);
    let value = Number(balanceOfbuyerBeforeTransaction) - Number(balanceAfterbuyerBuysStar);
    assert.equal(value, starPrice);
  }).timeout(20000);