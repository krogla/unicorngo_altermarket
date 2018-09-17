<template>
  <b-container>
    <h4 class="mb-3">{{msg}} <b-badge pill :variant="connStateClass" v-if="isWeb3">{{ connStateText }}</b-badge><b-badge pill variant="danger" v-else>MetaMask not loaded ?!</b-badge></h4>

    <b-pagination align="center" :total-rows="items.length" v-model="pagination.currentPage" :per-page="pagination.perPage" @input="loadCurrentPageItems"></b-pagination>
    <p>from <b-badge variant="danger">{{currentPageFirstIndex}}</b-badge> - to <b-badge variant="danger">{{currentPageLastIndex - 1}}</b-badge></p>

    <ul v-if="currentPageLoadedItemsCount === currentPageItems.length" class="list-inline">
      <li class="list-inline-item" v-for="item in currentPageItems" :key="item.unicornId">
        <b-card  :sub-title="'#'+item.unicornId"
                :img-src="(network == 'rinkeby' ? 'https://s3.eu-west-1.amazonaws.com/dev.s3.unicorngo.io/unicorn/' : 'https://s3.unicorngo.io/unicorn/') +item.unicornId+'-x.png'"
                :img-alt="'Unicorn #'+item.unicornId"
                img-top
                 style="max-width: 10rem;"
                 class="mb-2">
          <p class="card-text">

            <b-badge variant="info">&nbsp;{{item.priceCandy}}&nbsp;<svg class="card__candy"><use xlink:href="#candy"></use></svg></b-badge>
          </p>
        </b-card>
      </li>
    </ul>
    <template v-else>
      <label>Loading {{currentPageLoadedItemsCount}}/{{currentPageItems.length}}, wait...</label>
      <b-progress :value="currentPageLoadedItemsCount" :max="currentPageItems.length" show-progress animated class="mb-2"></b-progress>
    </template>

    <!--</b-card-group>-->
    <div style="display: none">
      <svg id="ethereum" viewBox="0 0 2.646 3.704" width="100%" height="100%"><title>ethereum</title><path d="M1.323 0l-.025.084v2.45l.025.024 1.137-.672z"></path><path d="M1.323 2.558V0L.186 1.886zm0 .216l-.014.017v.872l.014.041L2.46 2.102z"></path><path d="M1.323 2.774L.186 2.102l1.137 1.602z"></path></svg>
      <svg id="candy" viewBox="0 0 2.381 3.704" width="100%" height="100%"><title>candy</title><path d="M1.794.48s.014-.657-.347-.12C1.357.244.992-.05.897.007c-.096.058.18.57.249.824-.377.055-.717.365-.834.803-.118.438.022.876.32 1.112-.185.185-.688.455-.627.589.06.133.518.025.653-.03.045.645.36.07.36.07s.54.528.506.247c-.03-.262-.178-.535-.272-.709.378-.052.72-.363.838-.803.118-.44-.023-.88-.325-1.114.17-.104.433-.267.591-.478.17-.226-.562-.038-.562-.038zm-.572 2.664c.017.14-.307-.202-.307-.202-.067.027-.3.13-.343.078-.037-.046.087-.116.18-.196a.81.81 0 0 0 .38.097.482.482 0 0 1 .09.223zm.062-2.096a.015.015 0 0 1-.013.011c-.318.037-.595.297-.689.647-.094.35.016.714.274.905a.015.015 0 0 1 .003.02.013.013 0 0 1-.017.006.708.708 0 0 1-.364-.385.913.913 0 0 1-.033-.582.913.913 0 0 1 .32-.489.709.709 0 0 1 .51-.15c.007.001.01.01.009.017zM1.855.78a.482.482 0 0 1-.19.148.81.81 0 0 0-.376-.106C1.248.708 1.176.585 1.23.563c.064-.024.214.182.258.24 0 0 .452-.135.367-.022z" stroke-width="17.65"></path></svg>
    </div>
  </b-container>
</template>

<script>
import _ from 'lodash'
import ethers from 'ethers'

const BREEDING_ADDRESS = '0x93b7fa538913201066a262c03179c342262a7c76'
const BREEDING_ABI = [{'constant': true, 'inputs': [], 'name': 'isGamePaused', 'outputs': [{'name': '', 'type': 'bool'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '', 'type': 'uint256'}], 'name': 'hybridizations', 'outputs': [{'name': 'listIndex', 'type': 'uint256'}, {'name': 'price', 'type': 'uint256'}, {'name': 'exists', 'type': 'bool'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'getHybridizationPrice', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}, {'name': '_price', 'type': 'uint256'}], 'name': 'makeHybridization', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'getOfferPriceCandy', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '', 'type': 'uint256'}], 'name': 'market', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}, {'name': '_priceEth', 'type': 'uint256'}, {'name': '_priceCandy', 'type': 'uint256'}], 'name': 'sellUnicorn', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'cancelHybridization', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'getCreateUnicornPrice', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'buyUnicornWithEth', 'outputs': [], 'payable': true, 'stateMutability': 'payable', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}, {'name': '_count', 'type': 'uint256'}], 'name': 'minusFreezingTime', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}, {'name': '_count', 'type': 'uint256'}], 'name': 'minusTourFreezingTime', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_count', 'type': 'uint256'}, {'name': '_owner', 'type': 'address'}], 'name': 'createPresaleUnicorns', 'outputs': [{'name': '', 'type': 'bool'}], 'payable': true, 'stateMutability': 'payable', 'type': 'function'}, {'constant': false, 'inputs': [], 'name': 'createUnicornForCandy', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': true, 'stateMutability': 'payable', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'unicornToken', 'outputs': [{'name': '', 'type': 'address'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '', 'type': 'uint256'}], 'name': 'hybridizationList', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'getOfferPriceEth', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'deleteOffer', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'gen0PresaleLimit', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'gen0PresaleCount', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '', 'type': 'uint256'}], 'name': 'offers', 'outputs': [{'name': 'marketIndex', 'type': 'uint256'}, {'name': 'priceEth', 'type': 'uint256'}, {'name': 'priceCandy', 'type': 'uint256'}, {'name': 'exists', 'type': 'bool'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [], 'name': 'createUnicorn', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': true, 'stateMutability': 'payable', 'type': 'function'}, {'constant': false, 'inputs': [], 'name': 'withdrawTokens', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'unicornManagement', 'outputs': [{'name': '', 'type': 'address'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_percentCandy', 'type': 'uint256'}, {'name': '_percentEth', 'type': 'uint256'}], 'name': 'setSellDividendPercent', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'candyToken', 'outputs': [{'name': '', 'type': 'address'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'revokeUnicorn', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'gen0Count', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'sellDividendPercentCandy', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'blackBox', 'outputs': [{'name': '', 'type': 'address'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'deleteHybridization', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'buyUnicornWithCandy', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'plusTourFreezingTime', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'gen0Step', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_firstUnicornId', 'type': 'uint256'}, {'name': '_secondUnicornId', 'type': 'uint256'}], 'name': 'acceptHybridization', 'outputs': [], 'payable': true, 'stateMutability': 'payable', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'getEtherFeeForPriceInCandy', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [], 'name': 'init', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'gen0Limit', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'sellDividendPercentEth', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'hybridizationListSize', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'marketSize', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [], 'name': 'setGen0Limit', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'getCreateUnicornPriceInCandy', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_value', 'type': 'uint256'}], 'name': 'transferEthersToDividendManager', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'megaCandyToken', 'outputs': [{'name': '', 'type': 'address'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'inputs': [{'name': '_unicornManagementAddress', 'type': 'address'}], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'constructor'}, {'payable': true, 'stateMutability': 'payable', 'type': 'fallback'}, {'anonymous': false, 'inputs': [{'indexed': true, 'name': 'unicornId', 'type': 'uint256'}, {'indexed': false, 'name': 'price', 'type': 'uint256'}], 'name': 'HybridizationAdd', 'type': 'event'}, {'anonymous': false, 'inputs': [{'indexed': true, 'name': 'firstUnicornId', 'type': 'uint256'}, {'indexed': true, 'name': 'secondUnicornId', 'type': 'uint256'}, {'indexed': false, 'name': 'newUnicornId', 'type': 'uint256'}], 'name': 'HybridizationAccept', 'type': 'event'}, {'anonymous': false, 'inputs': [{'indexed': true, 'name': 'unicornId', 'type': 'uint256'}], 'name': 'HybridizationDelete', 'type': 'event'}, {'anonymous': false, 'inputs': [{'indexed': false, 'name': 'dividendManager', 'type': 'address'}, {'indexed': false, 'name': 'value', 'type': 'uint256'}], 'name': 'FundsTransferred', 'type': 'event'}, {'anonymous': false, 'inputs': [{'indexed': true, 'name': 'owner', 'type': 'address'}, {'indexed': true, 'name': 'unicornId', 'type': 'uint256'}, {'indexed': false, 'name': 'parent1', 'type': 'uint256'}, {'indexed': false, 'name': 'parent2', 'type': 'uint256'}], 'name': 'CreateUnicorn', 'type': 'event'}, {'anonymous': false, 'inputs': [{'indexed': false, 'name': 'limit', 'type': 'uint256'}], 'name': 'NewGen0Limit', 'type': 'event'}, {'anonymous': false, 'inputs': [{'indexed': false, 'name': 'step', 'type': 'uint256'}], 'name': 'NewGen0Step', 'type': 'event'}, {'anonymous': false, 'inputs': [{'indexed': true, 'name': 'unicornId', 'type': 'uint256'}, {'indexed': false, 'name': 'priceEth', 'type': 'uint256'}, {'indexed': false, 'name': 'priceCandy', 'type': 'uint256'}], 'name': 'OfferAdd', 'type': 'event'}, {'anonymous': false, 'inputs': [{'indexed': true, 'name': 'unicornId', 'type': 'uint256'}], 'name': 'OfferDelete', 'type': 'event'}, {'anonymous': false, 'inputs': [{'indexed': true, 'name': 'unicornId', 'type': 'uint256'}], 'name': 'UnicornSold', 'type': 'event'}, {'anonymous': false, 'inputs': [{'indexed': false, 'name': 'percentCandy', 'type': 'uint256'}, {'indexed': false, 'name': 'percentCandyEth', 'type': 'uint256'}], 'name': 'NewSellDividendPercent', 'type': 'event'}]

const BREEDINGDB_ADDRESS = '0xcc63c93f81aef965ef4768b3cb7007a89be41347'
const BREEDINGDB_ABI = [{'constant': true, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'hybridizationPrice', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'isGamePaused', 'outputs': [{'name': '', 'type': 'bool'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}, {'name': '_time', 'type': 'uint256'}], 'name': 'minusFreezeEndTime', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'freezeHybridizationsCount', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'freezeEndTime', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}, {'name': '_price', 'type': 'uint256'}], 'name': 'createHybridization', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '', 'type': 'uint256'}], 'name': 'hybridizations', 'outputs': [{'name': 'listIndex', 'type': 'uint256'}, {'name': 'price', 'type': 'uint256'}, {'name': 'exists', 'type': 'bool'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '', 'type': 'uint256'}], 'name': 'market', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}, {'name': '_statsSumHours', 'type': 'uint256'}], 'name': 'setStatsSumHours', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': false, 'inputs': [], 'name': 'incGen0Limit', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}, {'name': '_index', 'type': 'uint256'}], 'name': 'createFreeze', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}, {'name': '_count', 'type': 'uint256'}], 'name': 'setFreezeHybridizationsCount', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}, {'name': '_mustCalculate', 'type': 'bool'}], 'name': 'setFreezeMustCalculate', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': false, 'inputs': [], 'name': 'incGen0Count', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'freezeStatsSumHours', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '', 'type': 'uint256'}], 'name': 'hybridizationList', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'deleteOffer', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'gen0PresaleLimit', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'gen0PresaleCount', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}, {'name': '_time', 'type': 'uint256'}], 'name': 'setFreezeEndTime', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'offerPriceCandy', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '', 'type': 'uint256'}], 'name': 'offers', 'outputs': [{'name': 'marketIndex', 'type': 'uint256'}, {'name': 'priceEth', 'type': 'uint256'}, {'name': 'priceCandy', 'type': 'uint256'}, {'name': 'exists', 'type': 'bool'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'unicornManagement', 'outputs': [{'name': '', 'type': 'address'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'freezeMustCalculate', 'outputs': [{'name': '', 'type': 'bool'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'incFreezeIndex', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'gen0Count', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'incFreezeHybridizationsCount', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'offerExists', 'outputs': [{'name': '', 'type': 'bool'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'deleteHybridization', 'outputs': [{'name': '', 'type': 'bool'}], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '', 'type': 'uint256'}], 'name': 'unicornsFreeze', 'outputs': [{'name': 'index', 'type': 'uint256'}, {'name': 'hybridizationsCount', 'type': 'uint256'}, {'name': 'statsSumHours', 'type': 'uint256'}, {'name': 'freezingEndTime', 'type': 'uint256'}, {'name': 'mustCalculate', 'type': 'bool'}, {'name': 'exists', 'type': 'bool'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'gen0Step', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}, {'name': '_priceEth', 'type': 'uint256'}, {'name': '_priceCandy', 'type': 'uint256'}], 'name': 'createOffer', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'freezeExists', 'outputs': [{'name': '', 'type': 'bool'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': false, 'inputs': [], 'name': 'incGen0PresaleCount', 'outputs': [], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'init', 'outputs': [], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'gen0Limit', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'hybridizationListSize', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [], 'name': 'marketSize', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'hybridizationExists', 'outputs': [{'name': '', 'type': 'bool'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'offerPriceEth', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'constant': true, 'inputs': [{'name': '_unicornId', 'type': 'uint256'}], 'name': 'freezeIndex', 'outputs': [{'name': '', 'type': 'uint256'}], 'payable': false, 'stateMutability': 'view', 'type': 'function'}, {'inputs': [{'name': '_unicornManagementAddress', 'type': 'address'}], 'payable': false, 'stateMutability': 'nonpayable', 'type': 'constructor'}]

export default {
  name: 'Siring',
  data () {
    return {
      br_contract: null,
      msg: 'Alter Siring',
      name: '',
      // currentProvider: null,
      network: null,
      provider: null,
      signer: null,
      // items: [...Array(5)],
      items: [],
      pagination: {
        // pages: [{loaded: false}],
        currentPage: 1,
        perPage: 50
      }
    }
  },
  computed: {
    // showAlert () {
    //   return this.name.length > 4
    // },
    isWeb3 () {
      /* eslint-disable no-undef */
      return typeof web3 !== 'undefined'
      /* eslint-enable no-undef */
    },
    connStateClass () {
      return this.provider == null ? 'warning' : 'success'
    },
    connStateText () {
      return (this.provider == null ? 'Connecting to ' : 'Connected to ') + this.network
    },
    // offersChunks () {
    //   return _.chunk(this.items, this.pagination.perPage)
    // },
    currentPageItems () {
      return this.items.length ? _.chunk(this.items, this.pagination.perPage)[this.pagination.currentPage - 1] : []
    },
    currentPageFirstIndex () {
      return (this.pagination.currentPage - 1) * this.pagination.perPage
    },
    currentPageLastIndex () {
      let toIndex = this.currentPageFirstIndex + this.pagination.perPage
      if (toIndex > this.items.length) {
        toIndex = this.items.length
      }
      return toIndex
    },

    currentPageLoadedItemsCount () {
      return this.currentPageItems.filter(i => typeof i !== 'undefined').length
    },
    pagesCount () {
      return this.items.length ? Math.ceil(this.items.length / this.pagination.perPage) : 1
    }
  },
  methods: {
    getNetwork (netId) {
      let name
      switch (netId) {
        case '1':
          name = 'mainnet'
          break
        case '2':
          name = 'morden'
          break
        case '3':
          name = 'ropsten'
          break
        case '4':
          name = 'rinkeby'
          break
        case '42':
          name = 'kovan'
          break
        default:
          name = 'unknown'
      }
      return name
    },
    initItems () {
      if (this.network === 'rinkeby') {
        this.br_contract = new ethers.Contract(BREEDINGDB_ADDRESS, BREEDINGDB_ABI, this.provider)
      } else {
        this.br_contract = new ethers.Contract(BREEDING_ADDRESS, BREEDING_ABI, this.provider)
      }
      this.br_contract.functions.hybridizationListSize().then(function (cnt) {
        console.log('total items', cnt.toNumber())
        this.items = new Array(cnt.toNumber()) // [...Array(this.pagination.itemsTotal)]
        this.pagination.pages = new Array(this.pagesCount).fill({loaded: false})
        this.loadCurrentPageItems()
      }.bind(this))
    },

    loadItem (index) {
      this.br_contract.functions.hybridizationList(index).then(function (unicornId) {
        this.br_contract.functions.hybridizations(unicornId).then(function (hybr) {
          this.items.splice(index, 1, {
            unicornId: unicornId.toNumber(),
            priceCandy: ethers.utils.formatEther(hybr.price)
          })
        }.bind(this)).catch(e => { console.error('get offer', e) })
      }.bind(this)).catch(e => { console.error('get unicornId', e) })
    },
    loadCurrentPageItems () {
      if (this.currentPageLoadedItemsCount < this.currentPageItems.length) {
        for (let i = this.currentPageFirstIndex; i < this.currentPageLastIndex; i++) {
          // console.log(i)
          this.loadItem(i)
        }
      }
    }
  },
  mounted () {
    if (this.isWeb3) {
      /* eslint-disable no-undef */
      this.provider = new ethers.providers.Web3Provider(web3.currentProvider, this.getNetwork(web3.currentProvider.publicConfigStore.getState().networkVersion))
      this.network = this.provider.name
      // console.log(ethers.providers.networks)
      this.provider.listAccounts().then(function (acc) {
        this.signer = this.provider.getSigner(acc[0])
        console.log(this.signer)
      }.bind(this))
    } else {
      this.provider = ethers.providers.getDefaultProvider('homestead')
    }
    console.log(this.provider)
    this.initItems()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only lang="sass"-->
<style scoped>
  .card__candy, .card__ether {
    display: inline-block;
    position: relative;
    fill: rgba(255,255,255,.7);
    width: 10px;
    height: 15px;
    margin-top: -1px;
    margin-right: 6px;
    vertical-align: middle;
  }
</style>
