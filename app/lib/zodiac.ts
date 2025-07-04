/**
 * Determines the zodiac sign based on a date of birth string (YYYY-MM-DD)
 */
export function getZodiacSign(dobString: string): string {
  // Parse the date string
  const dob = new Date(dobString);
  const month = dob.getMonth() + 1; // getMonth() returns 0-11
  const day = dob.getDate();
  
  // Determine zodiac sign based on month and day
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return "Aquarius";
  } else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
    return "Pisces";
  } else if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return "Aries";
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return "Taurus";
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return "Gemini";
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return "Cancer";
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return "Leo";
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return "Virgo";
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return "Libra";
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return "Scorpio";
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return "Sagittarius";
  } else {
    return "Capricorn";
  }
}

/**
 * Returns characteristics of the zodiac sign
 */
export function getZodiacCharacteristics(sign: string): { 
  element: string; 
  traits: string[]; 
  compatibility: string[];
  luckyNumbers: number[];
} {
  const characteristics = {
    "Aries": {
      element: "Fire",
      traits: ["Courageous", "Determined", "Confident", "Enthusiastic", "Passionate"],
      compatibility: ["Leo", "Sagittarius", "Gemini", "Libra"],
      luckyNumbers: [1, 8, 17]
    },
    "Taurus": {
      element: "Earth",
      traits: ["Reliable", "Patient", "Practical", "Devoted", "Responsible"],
      compatibility: ["Virgo", "Capricorn", "Cancer", "Pisces"],
      luckyNumbers: [2, 6, 9]
    },
    "Gemini": {
      element: "Air",
      traits: ["Adaptable", "Outgoing", "Intelligent", "Curious", "Versatile"],
      compatibility: ["Libra", "Aquarius", "Aries", "Leo"],
      luckyNumbers: [3, 5, 14]
    },
    "Cancer": {
      element: "Water",
      traits: ["Intuitive", "Emotional", "Loyal", "Sympathetic", "Nurturing"],
      compatibility: ["Scorpio", "Pisces", "Taurus", "Virgo"],
      luckyNumbers: [2, 7, 11]
    },
    "Leo": {
      element: "Fire",
      traits: ["Creative", "Passionate", "Generous", "Warm-hearted", "Cheerful"],
      compatibility: ["Aries", "Sagittarius", "Gemini", "Libra"],
      luckyNumbers: [1, 5, 9]
    },
    "Virgo": {
      element: "Earth",
      traits: ["Analytical", "Practical", "Hardworking", "Loyal", "Kind"],
      compatibility: ["Taurus", "Capricorn", "Cancer", "Scorpio"],
      luckyNumbers: [5, 14, 23]
    },
    "Libra": {
      element: "Air",
      traits: ["Diplomatic", "Fair-minded", "Social", "Cooperative", "Gracious"],
      compatibility: ["Gemini", "Aquarius", "Leo", "Sagittarius"],
      luckyNumbers: [4, 6, 13]
    },
    "Scorpio": {
      element: "Water",
      traits: ["Resourceful", "Brave", "Passionate", "Stubborn", "Determined"],
      compatibility: ["Cancer", "Pisces", "Virgo", "Capricorn"],
      luckyNumbers: [8, 11, 18]
    },
    "Sagittarius": {
      element: "Fire",
      traits: ["Generous", "Idealistic", "Great sense of humor", "Adventurous", "Enthusiastic"],
      compatibility: ["Aries", "Leo", "Libra", "Aquarius"],
      luckyNumbers: [3, 7, 12]
    },
    "Capricorn": {
      element: "Earth",
      traits: ["Responsible", "Disciplined", "Self-control", "Good managers", "Practical"],
      compatibility: ["Taurus", "Virgo", "Scorpio", "Pisces"],
      luckyNumbers: [4, 8, 13]
    },
    "Aquarius": {
      element: "Air",
      traits: ["Progressive", "Original", "Independent", "Humanitarian", "Intellectual"],
      compatibility: ["Gemini", "Libra", "Sagittarius", "Aries"],
      luckyNumbers: [4, 7, 11]
    },
    "Pisces": {
      element: "Water",
      traits: ["Compassionate", "Artistic", "Intuitive", "Gentle", "Wise"],
      compatibility: ["Cancer", "Scorpio", "Taurus", "Capricorn"],
      luckyNumbers: [3, 9, 12]
    }
  };
  
  return characteristics[sign as keyof typeof characteristics] || {
    element: "Unknown",
    traits: ["Unknown"],
    compatibility: ["Unknown"],
    luckyNumbers: [0]
  };
} 