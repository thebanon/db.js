window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
if(!window.indexedDB) { window.alert("Your browser doesn't support a stable version of IndexedDB.") }

window.db = {

    con: null,

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

            var dbs = await indexedDB.databases();
            if(dbs.length > 0) { 
              var html = ``;
              var d = 0; do {
                html += `<li>`+dbs[d].name+`</li>`;
                d++; } while(d < dbs.length);
              document.getElementById('nav-section-ul').innerHTML = html;
            }
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
      table: (table,json) => {
        return new Promise((resolve,reject) => {
            var request = db.query([table], "readwrite").objectStore(table).add(json);
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

    delete: (table,id) => {
        return new Promise((resolve,reject) => {
            var request = db.query([table], "readwrite").objectStore(table).delete(id);
            request.onsuccess = function (event) {
                resolve();
            };
            request.onerror = function (event) {
                reject();
            }
        });
    }
  
};
