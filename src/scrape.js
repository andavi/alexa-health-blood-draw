var Xray = require('x-ray');
var x = Xray();
var request = require('request');
var async = require('async');
var fs = require('fs');
var jsonfile = require('jsonfile');
var prompt = require('prompt');
var file_exists = require('file-exists');

var file_name = 'data.json';

var safety = true;

var results_url = 'http://www.uncmedicalcenter.org/mclendon-clinical-laboratories/available-tests/search-results/';
var test_pages_links = [
  // A
  'ec4f8eca-a584-e411-ae9a-782bcb3b39aa', '4a406d94-2522-e711-9d2a-2c768a4e1b84&sort=3&page=2',
  // B
  'afe327d7-a584-e411-ae9a-782bcb3b39aa',
  // C
  'ddbe26e3-a584-e411-ae9a-782bcb3b39aa', '2571b6a0-2622-e711-9d2a-2c768a4e1b84&sort=3&page=2', '2571b6a0-2622-e711-9d2a-2c768a4e1b84&sort=3&page=3',
  // D
  '4dbf26e3-a584-e411-ae9a-782bcb3b39aa',
  // E
  'e76921e9-a584-e411-ae9a-782bcb3b39aa',
  // F
  'e5751eef-a584-e411-ae9a-782bcb3b39aa',
  // G
  'e7ae67f5-a584-e411-ae9a-782bcb3b39aa',
  // H
  '72af67f5-a584-e411-ae9a-782bcb3b39aa', 'd6f010b9-2522-e711-9d2a-2c768a4e1b84&sort=3&page=2',
  // I
  '205a62fb-a584-e411-ae9a-782bcb3b39aa',
  // J
  'e4c49301-a684-e411-ae9a-782bcb3b39aa',
  // K
  '81c3af07-a684-e411-ae9a-782bcb3b39aa',
  // L
  '7b47d50d-a684-e411-ae9a-782bcb3b39aa',
  // M
  'f047d50d-a684-e411-ae9a-782bcb3b39aa', 'e94fb9e7-2722-e711-9d2a-2c768a4e1b84&sort=3&page=2',
  // N
  'ca53d213-a684-e411-ae9a-782bcb3b39aa',
  // O
  '4ad9d21a-a684-e411-ae9a-782bcb3b39aa',
  // P
  '18dad21a-a684-e411-ae9a-782bcb3b39aa', '5f2fb1f3-2722-e711-9d2a-2c768a4e1b84&sort=3&page=2',
  // Q
  '28d8ee20-a684-e411-ae9a-782bcb3b39aa',
  // R
  'a5d8ee20-a684-e411-ae9a-782bcb3b39aa',
  // S
  '06510127-a684-e411-ae9a-782bcb3b39aa',
  // T
  'ab5a302d-a684-e411-ae9a-782bcb3b39aa', 'e012a80b-2822-e711-9d2a-2c768a4e1b84&sort=3&page=2',
  // U
  '325b302d-a684-e411-ae9a-782bcb3b39aa',
  // V
  'e7344533-a684-e411-ae9a-782bcb3b39aa',
  // W
  '1bc47d39-a684-e411-ae9a-782bcb3b39aa',
  // X
  'adc47d39-a684-e411-ae9a-782bcb3b39aa',
  // Z
  'f4258645-a684-e411-ae9a-782bcb3b39aa',
];

var letter_to_indices_map = {
  'a' : [0, 2],
  'b' : [2, 3],
  'c' : [3, 6],
  'd' : [6, 7],
  'e' : [7, 8],
  'f' : [8, 9],
  'g' : [9, 10],
  'h' : [10, 12],
  'i' : [12, 13],
  'j' : [13, 14],
  'k' : [14, 15],
  'l' : [15, 16],
  'm' : [16, 18],
  'n' : [18, 19],
  'o' : [19, 20],
  'p' : [20, 22],
  'q' : [22, 23],
  'r' : [23, 24],
  's' : [24, 25],
  't' : [25, 27],
  'u' : [27, 28],
  'v' : [28, 29],
  'w' : [29, 30],
  'x' : [30, 31],
  'z' : [31, 32]
};

prompt.start();

prompt.get(['letters'], function(err, result) {
  if (err) {
    console.log('Error -> ' + err);
  }
  else {
    var res = result['letters'].toLowerCase();
    console.log('Input -> ' + res);
    if (res.length == 1) {
      var code = res.charCodeAt(0);
      if (code >= 97 && code <= 122) {
        console.log('Input is valid!');
        if (!safety) {
          console.log('Commence scraping...');
          go(get_range(res));
        }
      }
      else {
        console.log('Invalid input - not a letter');
      }
    }
    else {
      console.log('Invalid input - length > 1');
    }
  }
});

var go = function(range) {
  test_links(range[0], range[1])
    .then(test_info)
    .then(create_json)
    .then(write_json)
    .then(() => {
      console.log('done!');
    })
    .catch(err => {
      console.error(err.message);
      console.error(err.stack);
    });
};

var get_range = function(letter) {
  return letter_to_indices_map[letter];
}

var test_links = function(start, end) {
  return new Promise(
    function(resolve, reject) {
      //test_pages_links.slice(13,15)
      async.map(test_pages_links.slice(start, end), get_test_links, function(err, links) {
        if (err) {
          reject(err);
        }
        else {
          var test_links = reformat_links(links);
          //console.log(test_links);
          resolve(test_links);
        }
      });
    }
  );
};

var test_info = function(test_links) {
  //var test_links = reformat_links(test_links_pre);
  return new Promise(
    function(resolve, reject) {
      async.map(test_links, get_test_info, function(err, data) {
        if (err) {
          reject(err);
        }
        else {
          //console.log(data);
          resolve(data);
        }
      });
    }
  );
};

var create_json = function(data) {
  //console.log(data);
  console.log('in create_json')
  var arr = null;
  var json = get_json();
  console.log('# of keys in data.json -> ' + Object.keys(json).length);
  for (var i=0; i<data.length; i++) {
    var current_test = data[i];
    console.log('TEST -> ' + current_test['name']);
    var test_obj = {};
    for (var j=0; j<current_test['data'].length; j++) {
      arr = current_test['data'][j]['info'];
      var prop = arr[0];
      try {
        if (prop.length >= 2 && prop.charCodeAt(0) != 32) {
          //console.log('prop -> ' + prop);
          var val = arr[arr.length-1];
          test_obj[prop] = val;
        }
      }
      catch (e) {
        console.log('caught err in create_json -> ' + e.message);
        console.log(JSON.stringify(current_test));
        break;
      }
    }
    if (test_obj.hasOwnProperty('Specimen') && (test_obj['Specimen'].toLowerCase().includes('blood') || test_obj['Specimen'].toLowerCase().includes('tube'))) {
      console.log('ADDING THIS TEST TO THE JSON');
      json[current_test['name']] = {link: current_test['link'], 'data': test_obj};
    }
    else {
      console.log('nope not adding it');
      console.log(test_obj['Specimen']);
      //console.log(JSON.stringify(current_test));
    }
    console.log('');
  }
  return json;
};

var get_json = function() {
  console.log('in get_json');
  if (file_exists.sync(file_name) == true) {
    return jsonfile.readFileSync(file_name)
  }
  else {
    return {};
  }
}

var write_json = function(json) {
  console.log('in write_json');
  return new Promise(
    function(resolve, reject) {
      jsonfile.writeFile(file_name, json, {spaces: 2}, function(err) {
        if (err) {
          reject(err);
        }
        resolve();
      });
    }
  );
};

var reformat_links = function(links_pre) {
  var links = [];
  for (var i=0; i<links_pre.length; i++) {
    for (var j=0; j<links_pre[i].length; j++) {
      if (links_pre[i][j]['link'].includes('professional-education-services') || links_pre[i][j]['link'].includes('mclendon-clinical-laboratories/available-tests')) {
        var l = strip_link(links_pre[i][j]['link']);
        links_pre[i][j]['link'] = l;
        links.push(links_pre[i][j]);
      }
    }
  }
  return links;
};

var strip_link = function(old_link) {
  //console.log('old link -> ' + old_link);
  var to_be_stripped = 'unc-medical-center/professional-education-services/';
  var index = old_link.indexOf(to_be_stripped);
  if (index > -1) {
    var new_link = old_link.slice(0, index) + old_link.slice(index+51, old_link.length);
    //console.log('new link -> ' + new_link);
    //console.log('');
    return new_link;
  }
  else {
    //console.log('link is fine');
    return old_link;
  }
};

var get_test_links = function(link, callback) {
  var path = '#ContentWrapper #ContentInner #ColumnsWrap #Columns #ColumnTwo #Content #PageContent .cmspage #FormsAndDocuments #VsMasterPage_MainContent_ResultsList ul li';
  //console.log('path -> ' + path);
  if (link.includes('page')) {
    link = 'http://www.uncmedicalcenter.org/mclendon-clinical-laboratories/available-tests/search-results/?searchId=' + link;
  }
  else {
    link = 'http://www.uncmedicalcenter.org/mclendon-clinical-laboratories/available-tests/search-results/?termId=' + link;
  }
  //console.log('link -> ' + link);
  x(link, path, [{
    test: 'a span',
    link: 'a@href'
  }])(function(err, data) {
    if (err) {
      callback(err);
    }
    else {
      //console.log('returned -> ' + link);
      callback(null, data);
    }
  });
};

//http://www.uncmedicalcenter.org/mclendon-clinical-laboratories/available-tests/karyotype-peripheral-blood-chromosome-analysis-cytogenetics/

//http://www.uncmedicalcenter.org/unc-medical-center/professional-education-services/mclendon-clinical-laboratories/available-tests/karyotype-peripheral-blood-chromosome-analysis-cytogenetics/"

var get_test_info = function(link_obj, callback) {
  //console.log('link -> ' + link_obj['link']);
  var path = '#BodyWrap #ContentWrapper #ContentInner #ColumnsWrap #Columns #ColumnTwo #Content #PageContent .cmspage .cmsPageContent table tbody tr';
  //var path = 'title';
  //console.log('path -> ' + path);
  x(link_obj['link'], path, [{
    info: ['td']
  }])(function(err, data) {
    if (err) {
      callback(err);
    }
    else {
      //console.log(data);
      //console.log('returned -> ' + link_obj['link']);
      var return_obj = {name: link_obj['test'], link: link_obj['link'], data: data};
      callback(null, return_obj);
    }
  });
};

//go();
