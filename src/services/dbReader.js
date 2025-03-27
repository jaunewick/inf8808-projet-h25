import Papa from 'papaparse';

class DBReader {
  constructor() {
    if (!DBReader.instance) {
      this._data = null;
      this.ready = this.loadData();
      DBReader.instance = this;
    }
    return DBReader.instance;
  }

  async loadData() {
    try {
      const response = await fetch('data/titanic_with_crew.csv');
      const text = await response.text();

      this._data = Papa.parse(text, {
        header: true,
        skipEmptyLines: true

      }).data;
    } catch (error) {
      console.error('Error loading CSV:', error);
    }
  }

  async getData() {
    await this.ready;
    return this._data;
  }
}

export default new DBReader();
