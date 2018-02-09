var Members = artifacts.require('./Members.sol')
var DataObjectHistory = artifacts.require('./DataObjectHistory.sol')

module.exports = function(deployer) {
  deployer.deploy(DataObjectHistory)
}
