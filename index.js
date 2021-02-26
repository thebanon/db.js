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
            if(db.schema) {
                var keys = Object.keys(db.schema);
                var values = Object.values(db.schema);
                if(keys.length > 0) {

                  var k = 0; do {

                    var key = keys[k];
                    var value = values[k];
                    var keyPath = value.keyPath;

                    if(keyPath) {
                    var objectStore = event.target.result.createObjectStore(key, {keyPath});
                    //console.log({key,keyPath});
                    }

                    var indices = value.indices;
                    var i = 0; do {
                      var indice = Object.keys(indices)[i];
                      var option = Object.values(indices)[i];
                      console.log(i, {indice,option});
                      objectStore.createIndex(indice, indice, option);
                    i++; } while(i < Object.keys(indices).length);

                  k++; } while(k < keys.length);
                  //console.log({keyPath});
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
                resolve(event);
            };
            request.onerror = function (event) {
                reject(event);
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

               var returnData = [];

               if(key) {
                 var index = Object.keys(key)[0], value = Object.values(key)[0];
                 var cursorRequest = db.con.transaction(table).objectStore(table).index(index).openCursor(IDBKeyRange.only(value));
               } else {
                 var cursorRequest = db.con.transaction([table], "readwrite").objectStore(table).openCursor(IDBKeyRange.lowerBound(0));
               }
               console.log('KEY',key,{table,index,value});

               cursorRequest.onerror = window.indexedDB.onerror;
               cursorRequest.onsuccess = function(e) {
                  var cursor = e.target.result;
                  if(!!cursor == false) {
                     resolve(returnData);
                     return
                  }
                  returnData.push(cursor.value);
                  cursor.continue();
               };

            });
        },
        row: (table,where,like) => {
            return new Promise((resolve,reject) => {
                var request = db.con.transaction(table).objectStore(table).index(where).get(like);
                request.onsuccess = (event) => resolve(event.target.result);
                request.onerror = (event) => reject(event.target);
            });
        }
    },

    update: {
      project: (domain) => { console.log({domain});

      },
      row: (table,json,id) => {
        return new Promise(async(resolve,reject) => {
            var update = db.query([table], "readwrite").objectStore(table).put(json);
            update.onsuccess = (event) => resolve(event.target.result);
            update.onerror = (event) => reject(event.target);
        });
      }
    },

    delete: {
      row: (table,where,like) => { console.log({table,where,like});
        return new Promise((resolve,reject) => {
            var transaction = db.con.transaction([table], "readwrite");
            var store = transaction.objectStore(table);
            var tagIndex = store.index(where);
            var remove = tagIndex.openKeyCursor(IDBKeyRange.only(like)); //opens all records bearing the selected tag number
            remove.onsuccess = () => {
                var cursor = remove.result;
                if(cursor) {
                    store.delete(cursor.primaryKey);
                    resolve("Deletion completed");
                    cursor.continue;
                }
            }
            remove.onerror = function() { reject("Deletion attempt NG"); }
        });
      }
    }

};
