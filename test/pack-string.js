const {funcer} = require("./funcer");
const {
    TON, FC_PACK_STRING, USER_ADDRESS
} = require("./utils");

const storage = () => {
    return [];
}

funcer({'logVmOps': false, 'logFiftCode': false}, {
    'path': './func/',
    'fc': FC_PACK_STRING,
    'data': storage(),
    'in_msgs': [
        {
            "sender": '0:' + USER_ADDRESS,
            "amount": 10 * TON,
            "body": [],
            "new_data": storage(),
            "exit_code": 0,
            "out_msgs": []
        },
    ],
    "get_methods": [
        {
            "name": "pack_string",
            "args": [
                ["cell", [
                    'string', 'alice'
                ]],
                ["cell", [
                    'string', '.ton'
                ]],
            ],
            "output": [
                ["cell", [
                    'uint8', 0,
                    'string', 'alice.ton'
                ]],
            ]
        },
        {
            "name": "pack_string",
            "args": [
                ["cell", [
                    'string', 'alicealicealicealicealicealicealicealicealicealicealicealicealicealicealicea$liceaealicealicealicealicealicealicealicealiceal'
                ]],
                ["cell", [
                    'string', '.ton'
                ]],
            ],
            "output": [
                ["cell", [
                    'uint8', 0,
                    'string', 'alicealicealicealicealicealicealicealicealicealicealicealicealicealicealicea$liceaealicealicealicealicealicealicealicealiceal',
                    'cell', [
                        'string', '.ton'
                    ]
                ]],
            ]
        },
    ],
});