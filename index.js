window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
if(!window.indexedDB) { window.alert("Your browser doesn't support a stable version of IndexedDB.") }

window.db = {

    con: null,

    open: (name,version) => {
        return new Promise((resolve,reject) => {
          var request = window.indexedDB.open(name,version);
          request.onerror = function(event) {
            console.log("error: ");
          };
          request.onsuccess = async function(event) {
            db.con = request.result;
            var tables = db.con.objectStoreNames;
            console.log("success: ", db.con,tables);
            resolve(tables);
          };
          request.onupgradeneeded = function(event) {
            console.log('onupgradeneeded', name);
            if(db.schema && db.schema.app) {
                var keys = db.schema["app"];
                if(keys.length > 0) {
                  var k = 0; do {
                    var key = keys[k];
                    console.log({key});
                    if(k === 0) { var keyPath = key; }
                    k++; } while(k < keys.length);
                  console.log({keyPath});
                  var objectStore = event.target.result.createObjectStore("app", {keyPath});
                  //objectStore.add(db.json.app[0]);
                }
            }
          };
        });
    },

    query: (tables,method) => {
        return db.con.transaction(tables,method);
    },

    create: {
      database: (name,version) => {
        return new Promise((resolve,reject) => {
          var request = window.indexedDB.open(name,version);
          request.onerror = function(event) {
            console.log("error: ");
          };
          request.onsuccess = async function(event) {
            db.con = request.result;
            var tables = db.con.objectStoreNames;
            console.log("success: ", db.con,tables);
            resolve(tables);
          };
          request.onupgradeneeded = function(event) {
            console.log('onupgradeneeded', db.schema.app);
            var keys = db.schema["app"];
            if(keys.length > 0) {
              var k = 0; do {
                var key = keys[k];
                console.log({key});
                if(k === 0) { var keyPath = key; }
                k++; } while(k < keys.length);
              console.log({keyPath});

              var objectStore = event.target.result.createObjectStore("app", {keyPath});
              objectStore.add(db.json.app[0]);
            }
          };
        });
      },
      row: (table,json) => { console.log({table,json});
        return new Promise((resolve,reject) => {
            var request = db.query([table],"readwrite").objectStore(table).add(json);
            request.onsuccess = function (event) {
                resolve();
            };
            request.onerror = function (event) {
                reject();
            }
        });
      }
    },

    read: {
        databases: async() => {
            return await indexedDB.databases();
        },
        table: (table,key) => {
            return new Promise((resolve,reject) => {

               var returnData = []; console.log(table);
               var trans = db.con.transaction([table], "readwrite");
               var store = trans.objectStore(table);

               var keyRange = IDBKeyRange.lowerBound(0);
               var cursorRequest = store.openCursor(keyRange);

               cursorRequest.onerror = window.indexedDB.onerror;
               cursorRequest.onsuccess = function(e) {
                  var result = e.target.result;
                  if(!!result == false) {
                     resolve(returnData);
                     return
                  }
                  returnData.push(result.value);
                  result.continue();
               };

            });
        },
        row: (table,key) => {
            return new Promise((resolve,reject) => {
                var request = db.query([table], "readwrite").objectStore(table).get(key);
                request.onsuccess = function (event) {
                    resolve(event.target);
                };
                request.onerror = function (event) {
                    reject(event.target);
                }
            });
        }
    },

    update: {
      row: (table,json,id) => {
        return new Promise((resolve,reject) => { console.log({table,id,json});
            var request = db.query([table], "readwrite").objectStore(table).put(json);
            request.onsuccess = function (event) {
                resolve();
            };
            request.onerror = function (event) {
                reject();
            }
        });
      }
    },

    delete: {
      row: (table,id) => {
          return new Promise((resolve,reject) => {
              var request = db.query([table], "readwrite").objectStore(table).delete(id);
              request.onsuccess = function (event) {
                  resolve(event);
              };
              request.onerror = function (event) {
                  reject(event);
              }
          });
      }
    }

};
