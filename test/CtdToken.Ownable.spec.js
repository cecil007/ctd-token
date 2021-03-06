import expectThrows from './lib/zeppelin-solidity/test/helpers/expectThrows';
import latestTime from './lib/zeppelin-solidity/test/helpers/latestTime';

/*global artifacts, assert, beforeEach, afterEach*/

const OwnableMock = artifacts.require('./helpers/CtdTokenMock.sol');


contract('CtdToken is Ownable', (accounts) => {
    let ownable;

    let owner = accounts[0];
    let newOwner = accounts[1];
    let stranger = accounts[2];

    beforeEach(async () => {
        const tenSeconds = 10;
        const timeNow = await latestTime();
        const preIcoOpeningTime = timeNow + tenSeconds;
        ownable = await OwnableMock.new(preIcoOpeningTime);
    });

    describe('constructor', async () => {
        it('should set an owner', async () => {
            assert.equal(await ownable.owner(), owner);
        });
    });

    describe('transferOwnership()', async () => {

        it('should assign the new owner being called by the old owner', async () => {
            await ownable.transferOwnership(newOwner, {from: owner});
            assert.equal(await ownable.owner(), newOwner);
        });

        it('should not allow changing the owner to non-owners', async () => {
            assert((await ownable.owner()) != stranger);
            await expectThrows(ownable.transferOwnership(newOwner, {from: stranger}));
        });

        it('should not allow changing the owner to null or 0 address', async () => {
            await expectThrows(ownable.transferOwnership(null, {from: owner}));
            await expectThrows(ownable.transferOwnership(0, {from: owner}));

            assert.equal(owner, await ownable.owner());
        });

        it('should emit OwnershipTransferred on succesful assignment', async () => {
            let result = await ownable.transferOwnership(newOwner);

            assert.lengthOf(result.logs, 1);
            let event = result.logs[0];
            assert.equal(event.event, 'OwnershipTransferred');
            assert.equal(event.args.previousOwner, owner);
            assert.equal(event.args.newOwner, newOwner);
        });
    });

    describe('onlyOwner<modifier>', async () => {

        it('should allow execution if called by the owner', async () => {
            let result = await ownable.testModifierOnlyOwner({from: owner});
            assert.equal(result, true);
        });

        it('should throw execution if called by non-owners', async () => {
            await expectThrows(ownable.testModifierOnlyOwner({from: stranger}));
        });

    });

});
