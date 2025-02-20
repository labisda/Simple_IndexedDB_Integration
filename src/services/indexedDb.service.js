const DATABASE_NAME = 'Simple_IndexedDB_Integration_DB';
const STORE_NAME = 'Employees';
const VERSION = 2;

export const openEmployeeDatabase = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            let store;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                console.log('Created object store');
            } else {
                store = event.target.transaction.objectStore(STORE_NAME);
                console.log('Using existing object store');
            }

            // Create the employeeId index if it doesn't exist
            if (!store.indexNames.contains('employeeId')) {
                store.createIndex('employeeId', 'employeeId', { unique: true });
                console.log('Created employeeId index');
            } else {
                console.log('employeeId index already exists');
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

// IndexedDB Service (getDataById, getAllData, submitData, deleteData, updateData)
export const indexedDbService = {
    // FETCH ALL DATA FROM THE OBJECT STORE
    getAllData: async () => {
        const db = await openEmployeeDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    },

    // ADD NEW DATA IN THE OBJECT STORE
    submitData: async (data) => {
        const db = await openEmployeeDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(data);

            request.onsuccess = () => {
                resolve();
            };
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    },

    updateData: async (employeeId, data) => {
        const db = await openEmployeeDatabase();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('employeeId');
            const getRequest = index.get(employeeId);

            getRequest.onsuccess = () => {
                const record = getRequest.result;
                if (record) {
                    // Update the data in the object store by key path (id)
                    const updateRequest = store.put({ ...record, ...data });

                    updateRequest.onsuccess = () => {
                        resolve();
                    };
                    updateRequest.onerror = (event) => {
                        reject(event.target.error);
                    };
                } else {
                    reject(new Error('Record not found'));
                }
            };

            getRequest.onerror = (event) => {
                reject(event.target.error);
            };
        });
    },

    // DELETE DATA FROM THE OBJECT STORE
    deleteData: async (employeeId) => {
        const db = await openEmployeeDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            // Retrieve the record with the given employeeId
            const index = store.index('employeeId');
            const getRequest = index.get(employeeId);

            getRequest.onsuccess = () => {
                const record = getRequest.result;
                if (record) {
                    // Delete the data from the object store by key path (id)
                    const deleteRequest = store.delete(record.id);

                    deleteRequest.onsuccess = () => {
                        resolve();
                    };
                    deleteRequest.onerror = (event) => {
                        reject(event.target.error);
                    };
                } else {
                    reject(new Error('Record not found'));
                }
            };

            getRequest.onerror = (event) => {
                reject(event.target.error);
            };
        });
    },

    deleteAllData: async () => {
        const db = await openEmployeeDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => {
                resolve();
            };
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
};