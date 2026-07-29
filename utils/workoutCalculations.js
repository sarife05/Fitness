function calculateVolume(setsNum, repsNum, weightNum) {
    return setsNum * repsNum * weightNum;
}

function categorizeLoad(totalVolume) {
    if (totalVolume < 500) return 'Low';
    if (totalVolume <= 1000) return 'Moderate';
    return 'High';
}

function minRequiredMinutes(totalReps, secondsPerRep = 2) {
    return (totalReps * secondsPerRep) / 60;
}

module.exports = { calculateVolume, categorizeLoad, minRequiredMinutes };