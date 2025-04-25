import Papa from "papaparse";

class DBReader {
  #titanicData;
  #lifeboatsData;

  constructor() {
    if (!DBReader.instance) {
      this.#titanicData = null;
      this.#lifeboatsData = null;
      this.titanicReady = this.loadTitanicData();
      this.lifeboatsReady = this.loadLifeboatsData();
      DBReader.instance = this;
    }
    return DBReader.instance;
  }

  async loadTitanicData() {
    try {
      const titanicResponse = await fetch("data/titanicWithCrew.csv");
      const titanicText = await titanicResponse.text();
      this.#titanicData = Papa.parse(titanicText, {
        header: true,
        skipEmptyLines: true,
      }).data;
    } catch (error) {
      console.error('Error loading CSV:', error);
      this.#titanicData = [];
    }
  }

  async loadLifeboatsData() {
    try {
      const response = await fetch('data/Lifeboats.csv');
      const text = await response.text();

      this.#lifeboatsData = Papa.parse(text, {
        header: true,
        skipEmptyLines: true
      }).data;
    } catch (error) {
      console.error('Error loading CSV:', error);
      this.#lifeboatsData = [];
    }
  }

  async getLifeboatsData() {
    await this.lifeboatsReady;
    return this.#lifeboatsData;
  }

  async getTitanicData() {
    await this.titanicReady;
    return this.#titanicData;
  }
}

export default new DBReader();
