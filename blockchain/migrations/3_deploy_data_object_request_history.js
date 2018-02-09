var Members = artifacts.require('./Members.sol')
var DataObjectRequestHistory = artifacts.require('./DataObjectRequestHistory.sol')

module.exports = function(deployer) {
  deployer.deploy(DataObjectRequestHistory)
}
