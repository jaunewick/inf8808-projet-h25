import dbReader from "./dbReader";

class SurvivalCalculator {
  /**
   * Calcule la probabilité de survie selon les critères.
   * @param {Object} options - Options de filtrage.
   * @param {boolean|null} options.isChild - true si <18 ans, false si >=18, null pour ignorer.
   * @param {boolean|null} options.isMale - true pour homme, false pour femme, null pour ignorer.
   * @param {number|null} options.passengerClass - 1, 2 ou 3 pour la classe sociale, null pour ignorer.
   * @param {[number, number]|null} options.ageRange - Tableau [minAge, maxAge], null pour ignorer.
   */
  async getSurvivalProbability({ isChild = null, isMale = null, passengerClass = null, ageRange = null } = {}) {
    const data = await dbReader.getTitanicData();

    let filteredData = data;

    // Filtrage enfant/adulte
    if (isChild !== null) {
      filteredData = filteredData.filter(d => {
        const age = parseFloat(d.age);
        return !isNaN(age) && (isChild ? age < 18 : age >= 18);
      });
    }

    // Filtrage sexe
    if (isMale !== null) {
      filteredData = filteredData.filter(d => d.gender === (isMale ? "male" : "female"));
    }

    // Filtrage classe sociale
    if (passengerClass !== null) {
      const classMap = { 1: "1st", 2: "2nd", 3: "3rd" };
      filteredData = filteredData.filter(d => d.class === classMap[passengerClass]);
    }

    // Filtrage tranche d’âge personnalisée
    if (ageRange !== null && Array.isArray(ageRange) && ageRange.length === 2) {
      const [minAge, maxAge] = ageRange;
      filteredData = filteredData.filter(d => {
        const age = parseFloat(d.age);
        return !isNaN(age) && age >= minAge && age <= maxAge;
      });
    }

    const validData = filteredData.filter(d => d.survived === "yes" || d.survived === "no");
    const total = validData.length;

    if (total === 0) return null;

    const survivors = validData.filter(d => d.survived === "yes").length;
    return (survivors / total) * 10;
  }
}

export default new SurvivalCalculator();
