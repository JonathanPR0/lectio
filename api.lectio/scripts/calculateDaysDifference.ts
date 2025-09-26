import { calculateDaysDifference, calculateHoursDifference } from "../utils/calculate";

// Mock de profile para simular diferentes lastActivityDate
interface MockProfile {
  lastActivityDate: Date;
}

// Executa os testes
console.log("=== Teste da função calculateDaysDifference ===\n");

// testCases.forEach((testCase, index) => {
const mockProfile: MockProfile = {
  lastActivityDate: new Date("2025-09-25T21:42:31.160Z"),
};

console.log(mockProfile.lastActivityDate, new Date("2025-09-26T11:35:27.707Z"));

// Simula a linha do código: const daysDifference = calculateDaysDifference(new Date(), profile.lastActivityDate);
const daysDifference = calculateDaysDifference(
  new Date("2025-09-26T20:35:27.707Z"),
  mockProfile.lastActivityDate
);
const hoursDifference = calculateHoursDifference(
  new Date("2025-09-26T20:35:27.707Z"),
  mockProfile.lastActivityDate
);

console.log(`Teste: `);
console.log(`  lastActivityDate: ${mockProfile.lastActivityDate.toISOString().split("T")[0]}`);
console.log(`  daysDifference: ${daysDifference}`);
console.log(`  hoursDifference: ${hoursDifference}`);
console.log("---");
// });

console.log("Testes concluídos!");
