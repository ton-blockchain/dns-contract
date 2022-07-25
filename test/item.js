const {funcer} = require("./funcer");
const {
    makeStorageItemNonInit, FC_COLLECTION, DNS_NEXT_RESOLVER_PREFIX,
    TON, COLLECTION_ADDRESS, OWNER_ADDRESS, USER_ADDRESS, YEAR, FC_ITEM, makeStorageItem, AUCTION_START_TIME,
    AUCTION_START_DURATION,
    MONTH,
    AUCTION_END_DURATION
} = require("./utils");

const makeInit = (monthFromStart) => {
    if (monthFromStart > 12) monthFromStart = 12;
    const time = AUCTION_START_TIME + monthFromStart * MONTH;
    return [
        {
            "time": time,
            "sender": '0:' + COLLECTION_ADDRESS,
            "amount": 1000 * TON,
            "body": [
                'Address', '0:' + OWNER_ADDRESS,
                'cell', [
                    'string', 'alice'
                ],
            ],
            "new_data": makeStorageItem({
                auctionEndTime: time + AUCTION_START_DURATION - Math.floor((AUCTION_START_DURATION - AUCTION_END_DURATION) * monthFromStart / 12),
                lastFillUpTime: time
            }),
            "exit_code": 0,
            "out_msgs": []
        },
    ]
}

funcer({'logVmOps': false, 'logFiftCode': false}, {
    'path': './func/',
    'fc': FC_ITEM,
    'data': makeStorageItemNonInit(),
    'in_msgs': [
        {
            "time": AUCTION_START_TIME,
            "sender": '0:' + COLLECTION_ADDRESS,
            "amount": 1000 * TON,
            "body": [
                'Address', '0:' + OWNER_ADDRESS,
                'cell', [
                    'string', 'alice'
                ],
            ],
            "new_data": makeStorageItem({
                auctionEndTime: AUCTION_START_TIME + AUCTION_START_DURATION
            }),
            "out_msgs": []
        },
        { // not from collection address
            "time": AUCTION_START_TIME,
            "sender": '0:' + OWNER_ADDRESS,
            "amount": 1000 * TON,
            "body": [
                'Address', '0:' + OWNER_ADDRESS,
                'cell', [
                    'string', 'alice'
                ],
            ],
            "exit_code": 405
        },
    ]
        .concat(makeInit(1))
        .concat(makeInit(2))
        .concat(makeInit(3))
        .concat(makeInit(4))
        .concat(makeInit(5))
        .concat(makeInit(6))
        .concat(makeInit(7))
        .concat(makeInit(8))
        .concat(makeInit(9))
        .concat(makeInit(10))
        .concat(makeInit(11))
        .concat(makeInit(12))
        .concat(makeInit(13))
        .concat(makeInit(100))
});

