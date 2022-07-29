const {funcer} = require("./funcer");
const {
    makeStorageItemNonInit, FC_COLLECTION, DNS_NEXT_RESOLVER_PREFIX, AUCTION_START_DURATION,
    TON, COLLECTION_ADDRESS, OWNER_ADDRESS, USER_ADDRESS, YEAR, FC_ITEM, makeStorageItem,
    makeStorageItemComplete, AUCTION_START_TIME, CONTENT
} = require("./utils");


const CONTENT_WITH_WALLET = [ // content
    'uint8', 0,
    'uint256->cell', { // content
        '0x82a3537ff0dbce7eec35d69edc3a189ee6f17d82f353a553f9aa96cb0be3ce89': [
            'cell', [
                'uint8', 0,
                'string', 'alice.ton'
            ]
        ],
        '0xc9046f7a37ad0ea7cee73355984fa5428982f8b37c8f7bcec91f7ac71a7cd104': [
            'cell', [
                'uint8', 0,
                'string', 'TON Domain'
            ]
        ],
        '0x6105d6cc76af400325e94d588ce511be5bfdbb73b437dc51eca43917d7a43e3d': [
            'cell', [
                'uint8', 0,
                'string', 'https://dns.ton.org/icon.png#alice',
            ]
        ],
        '0xe8d44050873dba865aa7c170ab4cce64d90839a34dcfd6cf71d14e0205443b1b': [
            'cell', [
                'uint16', '0x9fd3',
                'Address', 'EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG',
                'uint1', 0
            ]
        ]
    },
];


const makeStorageItem1 = ({auctionEndTime}) => {
    return [
        "uint256", '38930916800118655128984401856443062677799436388671332167772672007419684920584', // index,
        "Address", '0:' + COLLECTION_ADDRESS, // collection_address
        "Address", '0:' + OWNER_ADDRESS, // owner_address
        'cell', CONTENT,
        'cell', [ // domain
            'string', 'alice',
        ],
        'uint1', 0, // auction maybe
        'uint64', AUCTION_START_TIME // last_fill_up_time
    ];
}

const makeStorageItem2 = ({auctionEndTime}) => {
    return [
        "uint256", '38930916800118655128984401856443062677799436388671332167772672007419684920584', // index,
        "Address", '0:' + COLLECTION_ADDRESS, // collection_address
        "Address", '0:' + OWNER_ADDRESS, // owner_address
        'cell', CONTENT_WITH_WALLET,
        'cell', [ // domain
            'string', 'alice',
        ],
        'uint1', 0, // auction maybe
        'uint64', AUCTION_START_TIME // last_fill_up_time
    ];
}

funcer({'logVmOps': false, 'logFiftCode': false}, {
    'path': './func/',
    'fc': FC_ITEM,
    'data': makeStorageItem1({}),
    'in_msgs': [
        {
            "time": AUCTION_START_TIME,
            "sender": '0:' + OWNER_ADDRESS,
            "contract_balance": 1000 * TON,
            "amount": 1 * TON,
            "body": [
                'uint32', 0x4eb1f0f9,
                'uint64', 123,
                'uint256', '0xe8d44050873dba865aa7c170ab4cce64d90839a34dcfd6cf71d14e0205443b1b',
                'cell', [
                    'uint16', '0x9fd3',
                    'Address', 'EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG',
                    'uint1', 0
                ]
            ],
            "new_data": makeStorageItem2({}),
            "out_msgs": [
            ]
        },
        {
            "time": AUCTION_START_TIME,
            "sender": '0:' + USER_ADDRESS,
            "contract_balance": 1000 * TON,
            "amount": 1 * TON,
            "body": [
                'uint32', 0x4eb1f0f9,
                'uint64', 123,
                'uint256', '0xe8d44050873dba865aa7c170ab4cce64d90839a34dcfd6cf71d14e0205443b1b',
                'cell', [
                    'uint16', '0x9fd3',
                    'Address', 'EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG',
                    'uint1', 0
                ]
            ],
            "exit_code": 411
        },
    ]
});

