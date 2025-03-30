import Papa from 'papaparse';

class DBReader {
  #data;

  constructor() {
    if (!DBReader.instance) {
      this.#data = null;
      this.ready = this.loadData();
      DBReader.instance = this;
    }
    return DBReader.instance;
  }

  async loadData() {
    try {
      const response = await fetch('data/titanic_with_crew.csv');
      const text = await response.text();

      this.#data = Papa.parse(text, {
        header: true,
        skipEmptyLines: true

      }).data;
    } catch (error) {
      console.error('Error loading CSV:', error);
      this.#data = [];
    }
  }

  async getData() {
    await this.ready;
    return this.#data;
  }
}

export default new DBReader();