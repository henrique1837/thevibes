// SPDX-License-Identifier: MIT
// An example of a consumer contract that relies on a subscription for funding.
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */

 contract VRFv2Consumer is VRFConsumerBaseV2,Ownable {
   VRFCoordinatorV2Interface COORDINATOR;

   // Your subscription ID.
   uint64 public s_subscriptionId;
   string public uri;
   // Goerli coordinator. For other networks,
   // see https://docs.chain.link/docs/vrf-contracts/#configurations
   address public vrfCoordinator = 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed;

   // The gas lane to use, which specifies the maximum gas price to bump to.
   // For a list of available gas lanes on each network,
   // see https://docs.chain.link/docs/vrf-contracts/#configurations
   bytes32 public keyHash = 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;

   // Depends on the number of requested values that you want sent to the
   // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
   // so 100,000 is a safe default for this example contract. Test and adjust
   // this limit based on the network that you select, the size of the request,
   // and the processing of the callback request in the fulfillRandomWords()
   // function.
   uint32 public callbackGasLimit = 2500000;

   // The default is 3, but you can set this higher.
   uint16 public requestConfirmations = 3;

   // For this example, retrieve 1 random values in one request.
   // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
   uint32 public numWords =  1;

   uint256[] public s_randomWords;
   uint256 public s_requestId;

   mapping(uint256 => string) public requestUri;
   using SafeMath for uint256;

   event Result(string uri,uint256 number,bool result);

   constructor(uint64 subscriptionId) VRFConsumerBaseV2(vrfCoordinator) {
     COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
     s_subscriptionId = subscriptionId;
   }


   // Assumes the subscription is funded sufficiently.
   function requestRandomWords(string memory _uri) external {
     // Will revert if subscription is not set and funded.
     s_requestId = COORDINATOR.requestRandomWords(
       keyHash,
       s_subscriptionId,
       requestConfirmations,
       callbackGasLimit,
       numWords
     );
     requestUri[s_requestId] = _uri;
   }

   function fulfillRandomWords(
     uint256 requestId, /* requestId */
     uint256[] memory randomWords
   ) internal override {
     s_randomWords = randomWords;
     string memory _uri = requestUri[requestId];
     bool result = false;
     if(randomWords[0].mod(2) == 0){
       result = true;
       uri = _uri;
     }
     emit Result(_uri,randomWords[0],result);
   }

 }
