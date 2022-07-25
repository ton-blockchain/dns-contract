const {exec} = require('child_process');
const fs = require('fs')

// look up tables
const to_hex_array = [];
const to_byte_map = {};
for (let ord = 0; ord <= 0xff; ord++) {
    let s = ord.toString(16);
    if (s.length < 2) {
        s = "0" + s;
    }
    to_hex_array.push(s);
    to_byte_map[s] = ord;
}

function bytesToHex(buffer) {
    const hex_array = [];
    //(new Uint8Array(buffer)).forEach((v) => { hex_array.push(to_hex_array[v]) });
    for (let i = 0; i < buffer.byteLength; i++) {
        hex_array.push(to_hex_array[buffer[i]]);
    }
    return hex_array.join("");
}

const makeType = (key) => {
    if (key === 'coins') {

        return 'Gram,';

    } else if (key === 'address') {

        return 'parse-smc-addr drop addr,'

    }  else if (key === 'Address') {

        return 'parse-smc-addr drop Addr,'

    } else if (key.startsWith('uint')) {

        const bits = key.substr(4);
        if (!Number(bits)) throw new Error('invalid uint bits "' + bits + '"');
        return bits + ' u,';

    } else if (key.startsWith('int')) {

        const bits = key.substr(3);
        if (!Number(bits)) throw new Error('invalid int bits "' + bits + '"');
        return bits + ' i,';

    } else if (key === 'string') {
        return '$,'
    } else if (key === 'bytes') {
        return 'B,'
    } else if (key === 'boc') {
        return 'B>boc ref,'
    } else {
        throw new Error('unsupported type "' + key + '"');
    }
}

const makeValue = (key, value) => {
    if (key === 'address' || key === 'Address') {
        return '"' + value + '"';
    } else if (key === 'string') {
        return '"' + value + '"';
    } else if (key === 'bytes' ) {
        return 'B{' + bytesToHex(value) + '}';
    }  else if (key === 'boc') {
        return 'B{' + value + '}';
    } else {
        return value;
    }
}

const makeMapKey = (key, value) => {
    if (key.startsWith('uint')) {

        const bits = key.substr(4);
        if (!Number(bits)) throw new Error('invalid uint bits "' + bits + '"');
        return value + ' rot ' + bits + ' udict! drop';

    } else if (key.startsWith('int')) {

        const bits = key.substr(3);
        if (!Number(bits)) throw new Error('invalid int bits "' + bits + '"');
        return value + ' rot ' + bits + ' idict! drop';

    } else {
        throw new Error('unsupported map type "' + key + '"');
    }
}

const makeMap = (key, value) => {
    const mapIndex = key.indexOf('->');
    const mapKey = key.substr(0, mapIndex);
    const mapValueKey = key.substr(mapIndex);

    let s = 'dictnew\n';
    let i = 0;
    for (let _key in value) {
        const _value = value[_key];
        s += makeCell(_value) + ' <s ' + makeMapKey(mapKey, _key) + '\n';
        i += 2;
    }

    return s;
}

const makeParam = (key, value) => {
    if (key.indexOf('->') > -1) {
        return makeMap(key, value) + ' dict,';
    }

    if (key === 'cell') {
        return makeCell(value) + ' ref,';
    }
    if (key === 'comment') {
        throw new Error('comment should be the only paramet');
    }

    return makeValue(key, value) + ' ' + makeType(key);
}

const makeCell = (arr) => {
    let s = '<b\n';
    let i = 0;
    if(arr.length == 2 && arr[0] == "comment") {
        return `<b 0 32 u, "${arr[1]}" 119 append-long-string b>`
    }
    while (i < arr.length) {
        const key = arr[i];
        const value = arr[i + 1];
        s += makeParam(key, value) + '\n';
        i += 2;
    }
    s += 'b>';
    return s;
}

const makeInMsg = (i, inMsg) => {
    const contractBalance = inMsg.contract_balance || '1000000000';

    return `
"${inMsg.sender}" // sender address
parse-smc-addr drop 2constant sender_address${i}

${inMsg.amount} constant msg_value${i} // in_msg amount

${makeCell(inMsg.body)} constant in_msg_body${i}

<b b{0110} s, // flags
   sender_address${i} Addr, // sender address
   sender_address${i} Addr, // dest address
   0 Gram,  // value
   0 1 u, // extra currency dict
   0 Gram, // ihr_fee
   0 Gram, // fwd_fee
b> constant in_msg${i}

0x076ef1ea           // magic
0                    // actions
0                    // msgs_sent
${inMsg.time || 1628090356}           // unixtime
1                    // block_lt
1                    // trans_lt
239                  // randseed
${contractBalance} null pair // balance_remaining
contract_address     // myself
global_config        // global_config
10 tuple 1 tuple constant c7

msg_value${i} in_msg${i} in_msg_body${i} <s 0 code storage c7 0x75 runvmx
// returns ...values exit_code new_c4 c5
swap rot

${inMsg.exit_code ? makeCheckExitCode(inMsg.exit_code) : makeCheckZeroExitCode()}

${inMsg.new_data ? makeCheckStorage(inMsg.new_data) : 'drop'}

${inMsg.out_msgs ? makeCheckOutMessages(inMsg.out_msgs) : 'drop'}
`;
}

const makeCheckZeroExitCode = () => {
    return `dup { ."Error: non-zero exit code (" . .")" cr 0 halt } { drop } cond`;
}

const makeCheckExitCode = (exitCode) => {
    return `dup ${exitCode} <> { ."Error: exit code ${exitCode} expected, but " . ."found" cr 0 halt } { drop } cond`
}

const makeCheckStorage = (newStorage) => {
    return `
${makeCell(newStorage)} constant correct_new_storage
hashu correct_new_storage hashu <> { ."Error: incorrect resulting storage" cr 0 halt } if
`;
}

const makeCheckOutMessages = (outMessages) => {
    return `
<s dup 0 swap { dup empty? not } {
  ref@ <s swap 1+ swap
} while drop
${outMessages.length} <> { ."Error: incorrect number of actions" cr 0 halt } if

${outMessages.reverse().map(outMsg => makeCheckOutMsg(outMsg)).join('\n')}
drop
    `
}

const makeExtDest = (dest) => {
    if (dest.startsWith('0x')) {
        return 'x{' + dest.substr(2) + '}';
    }
    throw new Error('ExtMsg.to: hex string expected instead of "' + dest + '"');
}

const makeCheckOutExtMsg = (outMsg) => {
    return `
4 B@+ swap B{0EC3C86D} B= not abort"Unsupported action"
8 u@+ swap =: send-mode
ref@+ <s swap ref@ <s parse-msg

\`ext msg.type eq? not { ."Error: external message expected" cr 0 halt } if
msg.body hashu ${makeCell(outMsg.body)} hashu <>
{ ."Error: incorrect message body" cr
  ."Expected " ${makeCell(outMsg.body)} <s csr.
  ."Got      " msg.body <s csr.
0 halt } if
${makeExtDest(outMsg.to)} shash msg.dest shash B= not { ."Error: incorrect message destination" cr 0 halt } if
send-mode ${("sendMode" in outMsg)? outMsg.sendMode : 2} <> 
{ ."Error: incorrect message sendmode" cr 
  ."Expected ${outMsg.sendMode}" cr
  ."Got      " send-mode .
0 halt } if
`
}

const makeCheckOutIntMsg = (outMsg) => {
    return `
4 B@+ swap B{0EC3C86D} B= not abort"Unsupported action"
8 u@+ swap =: send-mode
ref@+ <s swap ref@ <s parse-msg

\`int msg.type eq? not { ."Error: internal message expected" cr 0 halt } if
msg.body hashu ${makeCell(outMsg.body)} hashu <> 
{ ."Error: incorrect message body" cr 
  ."Expected " ${makeCell(outMsg.body)} <s csr.
  ."Got      " msg.body <s csr.
0 halt } if
"${outMsg.to}" parse-smc-addr drop msg.dest 2<> { ."Error: incorrect message destination" cr 0 halt } if
msg.value ${outMsg.amount} <> { ."Error: incorrect message value" cr 0 halt } if
send-mode ${("sendMode" in outMsg)? outMsg.sendMode : 3} <> 
{ ."Error: incorrect message sendmode" cr 
  ."Expected ${outMsg.sendMode}" cr
  ."Got " send-mode . cr
0 halt } if
`
}

const makeCheckReserveAction = (action) => {
    return `
4 B@+ swap B{36e6b809} B= not abort"Wrong reserve tag"
8 u@+ swap =: send-mode
Gram@+ swap =: actual-ton
dup =: actual-collection
${action.amount} =: expected-ton
<b b{0} s, <b b> ref, b> <s =: expected-collection
expected-ton actual-ton <> 
{ ."Error: incorrect reserve amount" cr 
  ."Expected " expected-ton . cr
  ."Got      " actual-ton . cr
0 halt } if

expected-collection s>c hashu actual-collection s>c hashu <> 
{ ."Error: incorrect currency collection" cr 
  ."Expected " expected-collection csr. cr
  ."Got      " actual-collection csr. cr
0 halt } if

send-mode ${action.mode} <> 
{ ."Error: incorrect reserve mode" cr 
  ."Expected " ${action.mode} . cr
  ."Got      " send-mode . cr
0 halt } if
`
}
const makeCheckOutMsg = (outMsg) => {
    if (outMsg.type == "Internal") {
        return makeCheckOutIntMsg(outMsg);
    } else if (outMsg.type == "External") {
        return makeCheckOutExtMsg(outMsg);
    } else if (outMsg.type == "Reserve") {
        return makeCheckReserveAction(outMsg);
    } else {
        throw new Error('unsupported outMsg type "' + outMsg.type + '"');
    }
};

const makeInMessages = (inMsgs) => {
    let s = '';
    for (let i in inMsgs) {
        s += makeInMsg(i, inMsgs[i]);
    }
    return s;
}

const makeConfigParams = (configParams) => {
    return makeMap('int32->any', configParams);
}

const makeStackValue = (type, value) => {
    if (type == "int") {
        return value;
    } else if (type == "null") {
        return 'null';
    } else if (type == "cell") {
        return makeCell(value);
    } else if (type == "string") {
        return '<b "' + value + '" $, b> <s';
    } else if (type == "bytes") {
        return '<b B{' + bytesToHex(value) + '} B, b> <s';
    } else if (type == "boc") {
        return 'B{' + value + '} B>boc <s';
    } else if (type == "hashu") {
        return value;
    } else if (type == "address") {
        return `"${value}" parse-smc-addr drop`;
    } else {
        throw new Error('unsupported stack type "' + type + '"');
    }
}

const stackValueSize = (type) => {
    if (type === 'address') {
        return 2;
    } else {
        return 1;
    }
}

const makeStackValues = (args) => {
    return args.map(pair => makeStackValue(pair[0], pair[1])).join(' ');
}

const makeOutputEntryCheck = (type, value) => {
    const check = 'not { ."Error: incorrect output value" cr 0 halt } if'
    if (type == "int") {
        return makeStackValue(type, value) + ` = ` + check;
    } else if (type == "address") {
        return makeStackValue(type, value) + ` 2= ` + check;
    } else if (type == "cell" || type === 'boc') {
        return ` hashu ` + makeStackValue(type, value) + ` hashu = ` + check;
    }  else if (type == "hashu") {
        return ` hashu ` + makeStackValue(type, value) + ` = ` + check;
    } else if (type == "null") {
        return ` null? ` + check;
    } else {
        throw new Error('unsupported stack type "' + type + '"');
    }
}

const makeOutputCheck = (output) => {
    return output.map(pair => makeOutputEntryCheck(pair[0], pair[1])).join('\n');
}

const calculateOutputLength = (output) => {
    return output.map(pair => stackValueSize(pair[0])).reduce((a, b) => a + b, 0);
}

const makeGetMethod = (getMethod) => {
    return `
${makeStackValues(getMethod.args)}
"${getMethod.name}" method_id code storage c7 0x15 runvmx drop
${makeCheckZeroExitCode()}
${!getMethod.output ? '' : `
depth ${calculateOutputLength(getMethod.output)} <>
{ ."Error: incorrect output length of ${getMethod.name}; output: " .s cr 0 halt } if
${makeOutputCheck(getMethod.output.reverse())}
`}
`;
}

const makeGetMethods = (getMethods) => {
    let s = '';
    for (let i in getMethods) {
        s += makeGetMethod(getMethods[i]);
    }
    return s;
}

const makeTestFif = (data) => {
    return `
"TonUtil.fif" include
"Asm.fif" include

// $ -- id
{ $>B crc16 0xffff and 0x10000 or } : method_id

{ rot = -rot = and } : 2=
{ 2= not } : 2<>

// s -- wc addr s'
{ 1 i@+ swap not abort"Internal address expected"
  1 i@+
  1 i@+ swap { 4 u@+ swap u@+ nip } if
  swap { 9 u@+ 32 } { 256 swap 8 } cond
  i@+ rot u@+
} : addr@+
{ addr@+ drop } : addr@

// s len -- res s'
{ tuck u@+ -rot swap
  <b -rot u, b> <s swap
} : s@+ // TODO: support for more than 256 bits or rather add C++ code for it
{ s@+ drop } : s@

// s -- addr s'
{ 1 i@+ swap abort"External address expected"
  1 i@+ swap
  { 9 u@+ swap s@+ }
  { x{} swap } cond
} : ext-addr@+
{ ext-addr@+ drop } : ext-addr@

// s --
{
  1 i@+ swap { ."not an internal message" cr 0 halt } if
  1 i@+ swap =: msg.ihr-disabled
  1 i@+ swap =: msg.bounce
  1 i@+ nip
  2 u@+ swap 0 <> { ."src = none expected" cr 0 halt } if
  addr@+ -rot 2=: msg.dest
  Gram@+ swap =: msg.value
  1 i@+ swap { ref@+ swap } { null } cond =: msg.extra
  Gram@+ nip Gram@+ nip
  64 u@+ nip 32 u@+ nip
  1 i@+ swap abort"StateInit is not supported"
  1 i@+ swap { ref@ } { s>c } cond =: msg.body
} : parse-int-msg

// s --
{
  2 u@+ swap 3 <> { ."not an outbound external message" cr 0 halt } if
  2 u@+ swap 0 <> { ."src = none expected" cr 0 halt } if
  ext-addr@+ swap =: msg.dest
  64 u@+ nip 32 u@+ nip
  1 i@+ swap abort"StateInit is not supported"
  1 i@+ swap { ref@ } { s>c } cond =: msg.body
 } : parse-ext-msg

// s --
{
  dup 1 i@
  { \`ext =: msg.type parse-ext-msg }
  { \`int =: msg.type parse-int-msg } cond
} : parse-msg

"compiled.fif" include <s constant code

${makeCell(data.data)} constant storage

${makeConfigParams(data.configParams)} constant global_config

<b <b b{00110} s, <b code s, b> ref, storage ref, b>
hashu -1 swap addr, b> <s constant contract_address

${makeInMessages(data.in_msgs)}

${makeGetMethods(data.get_methods)}

."All tests passed" cr
`;
}

const funcer = (options, data) => {
    const path = data.path;
    console.log(process.argv.join(' '));
    const compileFuncCmd = 'func -SP ' + ' -o ' + path + 'compiled.fif ' + data.fc.map(fc => path + fc).join(' ');
    const runFiftCmd = 'fift ' + path + 'test.fif';
    const testFif = makeTestFif(data);
    const logVmOps = options.logVmOps;
    const logFiftCode = options.logFiftCode;

    console.log(compileFuncCmd);
    exec(compileFuncCmd, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            // node couldn't execute the command
            process.exit(1);
            return;
        }

        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);

        if (logFiftCode) console.log(testFif);

        fs.writeFile(path + 'test.fif', testFif, err => {
            if (err) {
                console.error(err)
                process.exit(1);
                return
            }
            console.log('test.fif OK')

            console.log(runFiftCmd);

            exec(runFiftCmd, (err, stdout, stderr) => {
                if (err) {
                    console.error(err);
                    process.exit(1);
                    // node couldn't execute the command
                    return;
                }

                // the *entire* stdout and stderr (buffered)
                console.log(`stdout: ${stdout}`);
                if (stdout.toLowerCase().indexOf('error') > -1) {
                    process.exit(1);
                }
                if (logVmOps) {
                    console.log(`stderr: ${stderr}`);
                }
            });
        })
    });
}

module.exports = {funcer};