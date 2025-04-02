import Papa from "papaparse";

class DBReader {
  #titanicData;
  #lifeboatsData;

  constructor() {
    if (!DBReader.instance) {
      this.#titanicData = null;
      this.#lifeboatsData = null;
      this.ready = this.loadData();
      DBReader.instance = this;
    }
    return DBReader.instance;
  }

  async loadData() {
    try {
      // Load titanic data
      const titanicResponse = await fetch("data/titanic_with_crew.csv");
      const titanicText = await titanicResponse.text();
      this.#titanicData = Papa.parse(titanicText, {
        header: true,
        skipEmptyLines: true,
      }).data;

      // Load lifeboats data
      const lifeboatsResponse = await fetch("data/Lifeboats.csv");
      const lifeboatsText = await lifeboatsResponse.text();
      this.#lifeboatsData = Papa.parse(lifeboatsText, {
        header: true,
        skipEmptyLines: true,
      }).data;
    } catch (error) {
      console.error("Error loading CSV:", error);
      this.#titanicData = [];
      this.#lifeboatsData = [];
    }
  }

  async getTitanicData() {
    await this.ready;
    return this.#titanicData;
  }

  async getLifeboatsData() {
    await this.ready;
    return this.#lifeboatsData;
  }
}

export default new DBReader();
