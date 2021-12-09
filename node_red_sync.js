#!/bin/nodejs

// Example data
var hex = '5202001f001f44000000007568656c6c6f112aff010040d0000000690576164e610000000000000000000000000080436d380000000000000000f0d8ffff2090307d4b610000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000aaaa261700008bca0200ff15000065c502003200150000008cff0214f60300001f00000000000000000000000031fd4a47390095c90300d4fc67005e7acf';
var hex = '52020015001544000000007568656C6C6F112AFF010040D00002356905E10A4E610000000000000000000000000080436D380000000000000000F0D8FFFF2080206F4B610000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000AAAAC90C000036A20100C80B0000C79E010078001100000094FF0214C303000015000000000000000000000000E2FCD9E13A00892C02008DFC92005EE6E3'

// Record used below in the comments and examples                            .                                                 : : : : ....
var hex = '52020015001544000000007568656C6C6F112AFF010040D00302356905E10A4E610120014020501003221502670080436D380230100345020470ab0400002080206F4B6107300120607090A0060401040506079010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000AAAAC90C000036A20100C80B0000C79E010078001100000094FF0214C303000015000000000000000000000000E2FCD9E13A00892C02008DFC92005EE6E3';

var hex = '010040d00003356905ef5379611012345678000000000000000003df55610000000000000000f0d8ffff010060b876610000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000aaaa43260000003000000000000000000000e6000300000082ff0408a96b00000b0000000000000000001e0000dbfbf9b8e1ff8508640076fb220061a730';
//                                     -------- = total volume

var hex = '010040d00003356905ef5379611064000000000000000000000003df55610000000000000000f0d8ffff010060b876610000000000000000000000030000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000aaaa43260000003000000000000000000000e6000300000082ff0408a96b00000b0000000000000000001e0000dbfbf9b8e1ff8508640076fb220061a730';


// Find the actual data structure (skip over CoAP header if that exists)
function FindPayloadData(bytes) {

   var offset = 0;
   var found  = 0;
   for ( i = 0;  i < bytes.length ; i++) {

      if ( (toHex(bytes[i]) == '01' && toHex(bytes[i+1]) == '00' && toHex(bytes[i+2]) == '40') ||
           (toHex(bytes[i]) == '01' && toHex(bytes[i+1]) == '40' && toHex(bytes[i+2]) == '40') ||
           (toHex(bytes[i]) == '01' && toHex(bytes[i+1]) == '50' && toHex(bytes[i+2]) == '40')) {
           offset = i
           found  = 1;
      }
   }

   if (found == 0) {
      return -1;
   }

   return offset;
}


// Convert hex to signed decimal e.g. cb8 converts to -840
function HexToSignedInt(num) {

    numSize = num.length;

    var val = {
        mask: 0x8 * Math.pow(16, numSize-1),
        sub: -0x1 * Math.pow(16, numSize)
    }

    if ( parseInt(num, 16) && val.mask > 0) {
        return (val.sub + parseInt(num, 16))
    } else {
        return (parseInt(num,16))
    }
}

// Convert timestamp to human readable
function getFormattedDate(ts, detail) {
    var date = new Date();

    date.setTime(ts*1000);

    var month = date.getMonth() + 1;
    var day   = date.getDate();
    var hour  = date.getHours();
    var min   = date.getMinutes();
    var sec   = date.getSeconds();

    month = (month < 10 ? "0" : "") + month;
    day   = (day   < 10 ? "0" : "") + day;
    hour  = (hour  < 10 ? "0" : "") + hour;
    min   = (min   < 10 ? "0" : "") + min;
    sec   = (sec   < 10 ? "0" : "") + sec;

    var str = "";

    if ( detail == 'second' ) {
       var str = date.getFullYear() + "-" + month + "-" + day + " " +  hour + ":" + min + ":" + sec;
    }

    if ( detail == 'month' ) {
       var str = date.getFullYear() + "-" + month + "-" + day ;
    }

    return str;
}

function toHex(d) {
    return  ("0"+(Number(d).toString(16))).slice(-2).toLowerCase()
}

// The main dissector
function Decoder (bytes, payload_offset, port) {

   // Default value
   var np = '-';

   // Coap header data
   coap.Version                     = np;
   coap.Code                        = np;
   coap.Messageid                   = np;
   coap.Token                       = np;
   coap.Option1                     = np;
   coap.Path1                       = np;
   coap.Option2                     = np;
   coap.Path2                       = np;
   coap.Option3                     = np;
   coap.Path3                       = np;

   // Water meter data
   decoded.Deviceid                 = np;
   decoded.Telegramtype             = np;
   decoded.Fixedvalue               = np;
   decoded.Recordlength             = np;
   decoded.Identification           = np;
   decoded.Timestamp                = np;
   decoded.Status                   = np;
   decoded.Totalvolume              = np;
   decoded.Positivevolume           = np;
   decoded.Negativevolume           = np;
   decoded.Monthcuttimestamp        = np;
   decoded.Monthcuttotalvolume      = np;
   decoded.Flowperhour              = np;
   decoded.Temperature              = np;
   decoded.Error                    = np;
   decoded.Oldestlogtimestamp       = np;
   decoded.Archivedvolume           = np;
   decoded.Txtime                   = np;
   decoded.Rxtime                   = np;
   decoded.Lasttxtime               = np;
   decoded.Lastrxtime               = np;
   decoded.Txpower                  = np;
   decoded.Csq                      = np;
   decoded.Txfailcount              = np;
   decoded.Rsrq                     = np;
   decoded.Operatormode             = np;
   decoded.Currentband              = np;
   decoded.Activemodelastduratio    = np;
   decoded.Senttosrv                = np;
   decoded.Serverresp               = np;
   decoded.Psmfailcount             = np;
   decoded.Regfailcount             = np;
   decoded.Confailcount             = np;
   decoded.Modemcycleduration       = np;
   decoded.Ecl                      = np;
   decoded.Rssi                     = np;
   decoded.Actualcredit             = np;
   decoded.Totalcredits             = np;
   decoded.Nb                       = np;
   decoded.Snr                      = np;
   decoded.Battery                  = np;
   decoded.Totalvolume              = np;



   
   //Water Meter Status 
   decoded.burst               = 0;
   decoded.freeze              = 0;
   decoded.leakage             = 0;
   decoded.tamper              = 0;
   decoded.hardware_failure    = 0;
   decoded.negative_flow       = 0;
   decoded.low_battery         = 0;
   decoded.permanent_error         = 0;
   decoded.temporary_error         = 0;




   // Delta Volumes
   for (j = 1; j < 48; j++) {
      decoded['Deltavolume' + j] = 'np';
   }

   // Dissect the CoAP header
   if ( bytes[0] == 0x52 || bytes[0] == 0x42 ) {

      // Example data:
      //
      // 5202101f001f44000000007568656c6c6f112aff
      //
      // Version=52
      // Code=02
      // Message ID=21
      // Token=0015
      // Option=44 Path=00000000
      // Option=75 Path=68656C6C6F
      // Option=11 Path=2A
      // Device ID = 05693502
      // Sequence  = 0

      // Start at the beginning
      i = 0;

      // Version (1)
      coap.Version = bytes[i].toString(16);
      i++;

      // Code (1)
      coap.Code = bytes[i].toString(16);
      i++;

      // Message id (2)
      coap.Messageid = (bytes[i] << 8) + (bytes[i+1])
      i += 2;

      // Token id (2)
      coap.Token = '0x' + toHex(bytes[i]) + toHex(bytes[i+1])
      i += 2;

      // Option1 (1)
      coap.Option1 = '0x' + toHex(bytes[i])
      i += 1;

      // Path1 (4)
      coap.Path1 = '0x' + toHex(bytes[i]) + toHex(bytes[i+1]) + toHex(bytes[i+2]) + toHex(bytes[i+3])
      i += 4;

      // Option2 (1)
      coap.Option2 = '0x' + toHex(bytes[i])
      i += 1;

      // Path2 (5)
      coap.Path2 = '0x' + toHex(bytes[i]) + toHex(bytes[i+1]) + toHex(bytes[i+2]) + toHex(bytes[i+3]) + toHex(bytes[i+4])
      i += 5;

      // Option3 (1)
      coap.Option3 = '0x' + toHex(bytes[i])
      i += 1;

      // Path2 (1)
     coap.Path3 = '0x' + toHex(bytes[i])
      i += 1;

   }


   // Dissect the Water Meter Payload data

   // Regular telegram
   // Identification number  05693502
   // Current timestamp9/24/2021 5:29:05 PM
   // Status  01
   // Total volume, litres  541065504
   // Positive volume, litres  570626128
   // Negative volume, litres 6750741
   // Month cut off timestamp 1/1/2000
   // Month cut off Total volume, litres  51392514
   // Flow l/h  1879310917
   // Temperature, °C -99.96
   // Error 8020
   // Oldest timestamps in UNIX time,s9/22/2021 6:00:00 PM
   // Oldest log entry volume in litres  536948743
   // Volume1 diff, liters  28768
   // Volume2 diff, liters  41104
   // Volume3 diff, liters  1030
   // Volume4 diff, liters  1025
   // Volume5 diff, liters  1541
   // Volume6 diff, liters  36871
   // Volume7 diff, liters  16

   // Take the index of the actual sensor data, we passed the CoAP portion if it would be available
   i = payload_offset;

   // Telegram type (2)
   var type = "";
   data = toHex(bytes[i+1]) + toHex(bytes[i]);

   if ( data == '0001' ) {
      type = 'regular'
   }

   if ( data == '4001' ) {
      type = 'regular with AES'
   }

   if ( data == '5001' ) {
      type = 'regular with AES long header'
   }

   decoded.Telegramtype = type;
   i += 2;

   // Fixed 0x40 (1)
   decoded.Fixedvalue = '0x' + toHex(bytes[i])
   i += 1;

   // Recordlength (2)
   data = toHex(bytes[i+1]) + toHex(bytes[i]);
   decoded.Recordlength = parseInt(data,16)
   i += 2;

   // Deviceid (4)
   decoded.Deviceid = '0x' + toHex(bytes[i+3]) + toHex(bytes[i+2]) + toHex(bytes[i+1]) + toHex(bytes[i])
   i += 4;

   // Identification is the same as Device ID.
   decoded.Identification = decoded.Deviceid;

   // Timestamp (4)
   data = toHex(bytes[i+3]) + toHex(bytes[i+2]) + toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Timestamp = getFormattedDate(parseInt(data,16),'second');
   i += 4;

   // Status (1)
   var s = Number('0x' + toHex(bytes[i]));
   decoded.Status = '0x' + toHex(bytes[i]);


//    decoded.burst               = 0;
//    decoded.freeze              = 0;
//    decoded.leakage             = 0;
//    decoded.tamper              = 0;
//    decoded.hardware_failure    = 0;
//    decoded.negative_flow       = 0;
//    decoded.low_battery         = 0;
//    decoded.temporary_error     = 0;
//    decoded.permanent_error     = 0;


   //decode Status
     if (s >= Number('0xA0')){
        decoded.burst = 1;
        s -= Number('0xA0');
     }
     if (s >= Number('0x80')){
        decoded.freeze = 1;
        s -= Number('0x80');
     }
     if (s >= Number('0x60')){
        decoded.negative_flow = 1;
        s -= Number('0x60');
     }
     if (s >= Number('0x20')){
        decoded.leakage = 1;
        s -= Number('0x20');
     }
     if (s >= Number('0x10')){
        decoded.temporary_error = 1;
        s -= Number('0x10');
     }
     if (s >= Number('0x08')){
        decoded.permanent_error = 1;
        decoded.hardware_failure = 1;
        decoded.tamper = 1;
        s -= Number('0x08');
     }
     if (s >= Number('0x04')){
        decoded.low_battery = 1;
        s -= Number('0x04');
     }





   i += 1;



   // Total Volume (4)
   data = toHex(bytes[i+3]) + toHex(bytes[i+2]) + toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Totalvolume = parseInt(data,16);
   decoded.Totalvolume = decoded.Totalvolume.toFixed(0);
   i += 4;

   // Positive Volume (4)
   data = toHex(bytes[i+3]) + toHex(bytes[i+2]) + toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Positivevolume = parseInt(data,16);
   i += 4;

   // Negative Volume (4)
   data = toHex(bytes[i+3]) + toHex(bytes[i+2]) + toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Negativevolume = parseInt(data,16);
   i += 4;

   // Month cut timestamp (4)
   data = toHex(bytes[i+3]) + toHex(bytes[i+2]) + toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Monthcuttimestamp = getFormattedDate(parseInt(data,16),'month');
   i += 4;

   // Month cut total volume (4)
   data = toHex(bytes[i+3]) + toHex(bytes[i+2]) + toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Monthcuttotalvolume = parseInt(data,16);
   i += 4;

   // Flow l/h (4)
   data = toHex(bytes[i+3]) + toHex(bytes[i+2]) + toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Flowperhour = parseInt(data,16);
   i += 4;

   // Temperature (4)
   data = '0x' + toHex(bytes[i+3]) + toHex(bytes[i+2]) + toHex(bytes[i+1]) + toHex(bytes[i])
   fl = parseInt(data,16) / 100;
   decoded.Temperature = fl;
   i += 4;

   // Error (2)
   data = '0x' + toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Error = data;
   i += 2;

   // Oldest log value timestamp (4)
   data = toHex(bytes[i+3]) + toHex(bytes[i+2]) + toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Oldestlogtimestamp = getFormattedDate(parseInt(data,16),'second');
   i += 4;

   // Oldest log volume (4)
   data = toHex(bytes[i+3]) + toHex(bytes[i+2]) + toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Archivedvolume = parseInt(data,16);
   i += 4;

   // Delta volumes (1 to 47, each 2 bytes)
   var accumulation = 0;
   var totalvolume = decoded.Totalvolume * 1.0;
   for (j = 1; j < 48; j++) {
      data = toHex(bytes[i+1]) + toHex(bytes[i])

      // In case we get the half of the data
      if ( data == 'aaaa' || data == 'AAAA' ) {
         break
      }

      // var value = parseInt(data,16)/1000 + accumulation + totalvolume;
      var value = parseInt(data,16)/1000;
      decoded['Deltavolume' + j] = value.toFixed(0);
      accumulation = (accumulation + parseInt(data,16)) * 1.0;
      i += 2;
   }

   // Sync on the AAAA termination
   data = toHex(bytes[i+1]) + toHex(bytes[i])
   if ( data == 'aaaa' || data == 'AAAA' ) {
       i += 2;
   }

   // TX_time (4)
   data = toHex(bytes[i+3]) + toHex(bytes[i+2]) + toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Txtime = parseInt(data,16);
   i += 4;

   // RX_time (4)
   data = toHex(bytes[i+3]) + toHex(bytes[i+2]) + toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Rxtime = parseInt(data,16);
   i += 4;

   // Last TX time (4)
   data = toHex(bytes[i+3]) + toHex(bytes[i+2]) + toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Lasttxtime = parseInt(data,16);
   i += 4;

   // Last RX time (4)
   data = toHex(bytes[i+3]) + toHex(bytes[i+2]) + toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Lastrxtime = parseInt(data,16);
   i += 4;

   // Txpower (2)
   data = toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Txpower = parseInt(data,16);
   i += 2;

   // Csq (2)
   data = toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Csq = parseInt(data,16);
   i += 2;

   // Tx fail count (2)
   data = toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Txfailcount = parseInt(data,16);
   i += 2;

   // Rsrq (1)
   data = toHex(bytes[i+1]) + toHex(bytes[i])
   var si = HexToSignedInt(data);
   // decoded.Rsrq = si + '  0x' + data;
   decoded.Rsrq = si;
   i += 2;

   // Operator mode (1)
   data = toHex(bytes[i])
   decoded.Operatormode = parseInt(data,16);
   i += 1;

   // Current band (1)
   data = toHex(bytes[i])
   decoded.Currentband = parseInt(data,16);
   i += 1;

   // Active mode last duration (4)
   data = toHex(bytes[i+3]) + toHex(bytes[i+2]) + toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Activemodelastduration = parseInt(data,16);
   i += 4;

   // Senttosrv
   data = toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Senttosrv = parseInt(data,16);
   i += 2;

   // Serverresp
   data = toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Serverresp = parseInt(data,16);
   i += 2;

   // Psmfailcount
   data = toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Psmfailcount = parseInt(data,16);
   i += 2;

   // Regfailcount
   data = toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Regfailcount = parseInt(data,16);
   i += 2;

   // Confailcount
   data = toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Confailcount = parseInt(data,16);
   i += 2;

   // Modemcycle
   data = toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Modemcycleduration = parseInt(data,16);
   i += 2;

   // Ecl
   data = toHex(bytes[i])
   decoded.Ecl = parseInt(data,16);
   i += 1;

   // Rssi
   data = toHex(bytes[i+1]) + toHex(bytes[i])
   var si = HexToSignedInt(data) / 10;
   // decoded.Rssi = si + '  0x' + data;
   decoded.Rssi = si;
   i += 2;

   // Actual Credits
   data = toHex(bytes[i+3]) + toHex(bytes[i+2]) + toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Actualcredits = parseInt(data,16);
   i += 4;

   // Total Credits
   data = toHex(bytes[i+3]) + toHex(bytes[i+2]) + toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Totalcredits = parseInt(data,16);
   i += 4;

   // Nb
   data = toHex(bytes[i+1]) + toHex(bytes[i])
   var si = HexToSignedInt(data) / 10;
   // decoded.Nb = si + '  0x' + data;
   decoded.Nb = si;
   i += 2;

   // Snr
   data = toHex(bytes[i+1]) + toHex(bytes[i])
   decoded.Snr = parseInt(data,16);
   i += 2;

   // Battery
   data = toHex(bytes[i])
   decoded.Battery = parseInt(data,16);
   i += 1;

   return decoded ;

}

// Convert a hex string to a byte array
function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

// Convert a byte array to a hex string
function bytesToHex(bytes) {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
    }
    return hex.join("");
}


var coap = {};
var decoded = {};

var buffer = hexToBytes(hex);

var payload_offset = FindPayloadData(buffer);

if (payload_offset == -1) {
   console.log('Not a valid water meter record, check the telegram types and the fixed value of 0x40');
   return
}

// Decode the data
Decoder (buffer, payload_offset, 0)

console.log('');
console.log('Hex data:');
console.log('');
console.log('' + hex);

console.log('');
console.log('[CoAP Section]');
console.log('Version                : ' + coap.Version);
console.log('Code                   : ' + coap.Code);
console.log('Messageid              : ' + coap.Messageid);
console.log('Token                  : ' + coap.Token);
console.log('Option1                : ' + coap.Option1);
console.log('Path1                  : ' + coap.Path1);
console.log('Option2                : ' + coap.Option2);
console.log('Path2                  : ' + coap.Path2);
console.log('Option3                : ' + coap.Option3);
console.log('Path3                  : ' + coap.Path3);
console.log('');

console.log('[Water Meter Section]');
console.log('Telegramtype           : ' + decoded.Telegramtype);
console.log('Fixedvalue (0x40)      : ' + decoded.Fixedvalue);
console.log('Recordlength           : ' + decoded.Recordlength);
console.log('Identification         : ' + decoded.Identification);
console.log('Timestamp              : ' + decoded.Timestamp);
console.log('Status                 : ' + decoded.Status);
console.log('Totalvolume            : ' + decoded.Totalvolume);
console.log('Positivevolume         : ' + decoded.Positivevolume);
console.log('Negativevolume         : ' + decoded.Negativevolume);
console.log('Month cut timestamp    : ' + decoded.Monthcuttimestamp);
console.log('Month cut total vol    : ' + decoded.Monthcuttotalvolume);
console.log('Flowperhour            : ' + decoded.Flowperhour);
console.log('Temperature (°C)       : ' + decoded.Temperature);
console.log('Error                  : ' + decoded.Error);
console.log('Oldestlogtimestamp     : ' + decoded.Oldestlogtimestamp);


// Newly added parameter logs

console.log('burst                  : ' + decoded.burst);
console.log('freeze                 : ' + decoded.freeze);
console.log('leakage                : ' + decoded.leakage);
console.log('tamper                 : ' + decoded.tamper);
console.log('hardware_failure       : ' + decoded.hardware_failure);
console.log('negative_flow          : ' + decoded.negative_flow);
console.log('low_battery            : ' + decoded.low_battery);
console.log('temporary_error        : ' + decoded.temporary_error);
console.log('permanent_error        : ' + decoded.permanent_error);








// Delta volumes (2)
for (j = 1; j < 48; j++) {

   var data = decoded['Deltavolume' + j];

   if (j < 10) {
      console.log('Delta volume ' + j + '         : ' + data);
   } else {
      console.log('Delta volume ' + j + '        : ' + data);
   }
}

console.log('Archivedvolume         : ' + decoded.Archivedvolume);
console.log('Totalvolume            : ' + decoded.Totalvolume);
console.log('Txtime                 : ' + decoded.Txtime);
console.log('Rxtime                 : ' + decoded.Rxtime);
console.log('Lasttxtime             : ' + decoded.Lasttxtime);
console.log('Lastrxtime             : ' + decoded.Lastrxtime);
console.log('Txpower                : ' + decoded.Txpower);
console.log('Csq                    : ' + decoded.Csq);
console.log('Txfailcount            : ' + decoded.Txfailcount);
console.log('Operatormode           : ' + decoded.Operatormode);
console.log('Currentband            : ' + decoded.Currentband);
console.log('Activemodelastduration : ' + decoded.Activemodelastduration);
console.log('Senttosrv              : ' + decoded.Senttosrv);
console.log('Serverresp             : ' + decoded.Serverresp);
console.log('Psmfailcount           : ' + decoded.Psmfailcount);
console.log('Regfailcount           : ' + decoded.Regfailcount);
console.log('Confailcount           : ' + decoded.Confailcount);
console.log('Modemcycleduration     : ' + decoded.Modemcycleduration);
console.log('Ecl                    : ' + decoded.Ecl);
console.log('Rsrq                   : ' + decoded.Rsrq);
console.log('Rssi [dBm]             : ' + decoded.Rssi);
console.log('Nb Power RSSI,[dBm]    : ' + decoded.Nb);
console.log('Snr                    : ' + decoded.Snr);
console.log('battery_level              : ' + decoded.Battery);
console.log('Actualcredits          : ' + decoded.Actualcredits);
console.log('Totalcredits           : ' + decoded.Totalcredits);

console.log('')
console.log('')

console.log(JSON.stringify(decoded))

console.log('')
console.log('')
