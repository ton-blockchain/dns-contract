const {funcer} = require("./funcer");
const {
    makeStorageItemNonInit, FC_COLLECTION, DNS_NEXT_RESOLVER_PREFIX, AUCTION_START_DURATION, makeStorageItemComplete,
    TON, COLLECTION_ADDRESS, OWNER_ADDRESS, USER_ADDRESS, YEAR, FC_ITEM, makeStorageItem,
    AUCTION_START_TIME
} = require("./utils");


funcer({'logVmOps': false, 'logFiftCode': false}, {
    'path': './func/',
    'fc': FC_ITEM,
    'data': makeStorageItemComplete({}),
    'in_msgs': [
        {
            "time": AUCTION_START_TIME + 123000,
            "sender": '0:' + OWNER_ADDRESS,
            "amount": 1000 * TON,
            "body": [],
            "new_data": makeStorageItemComplete({
                lastFillUpTime: AUCTION_START_TIME + 123000
            }),
            "out_msgs": []
        },
        {
            "time": AUCTION_START_TIME,
            "sender": '0:' + USER_ADDRESS,
            "amount": 1000 * TON,
            "body": [],
            "new_data": makeStorageItemComplete({}),
            "exit_code": 406
        },

    ]
});

