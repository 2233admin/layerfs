//! Undo only touched open-state entries; never copy the resident map.
use std::collections::BTreeMap;

pub(crate) struct JournalMap<K, V> {
    pub rows: BTreeMap<K, V>,
    undo: Vec<(K, Option<V>)>,
}
impl<K, V> Default for JournalMap<K, V> {
    fn default() -> Self {
        Self {
            rows: BTreeMap::new(),
            undo: Vec::new(),
        }
    }
}
impl<K: Ord + Clone, V> JournalMap<K, V> {
    pub fn put(&mut self, key: K, value: V) {
        let before = self.rows.insert(key.clone(), value);
        self.undo.push((key, before));
    }
    pub fn remove(&mut self, key: K) {
        if let Some(before) = self.rows.remove(&key) {
            self.undo.push((key, Some(before)));
        }
    }
    pub fn commit(&mut self) {
        self.undo.clear();
    }
    pub fn rollback(&mut self) {
        for (key, before) in self.undo.drain(..).rev() {
            match before {
                Some(value) => {
                    self.rows.insert(key, value);
                }
                None => {
                    self.rows.remove(&key);
                }
            }
        }
    }
}
