var Members = artifacts.require('./Members.sol')
var DataObjectMemberOwnerships = artifacts.require('./DataObjectMemberOwnerships.sol')

module.exports = function(deployer) {
  deployer.deploy(Members)
  deployer.deploy(DataObjectMemberOwnerships)
}
