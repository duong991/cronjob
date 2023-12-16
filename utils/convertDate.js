// convert 2023-12-09 -> 09/12/2023
function convertDate(date) {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
}

module.exports = {
    convertDate,
};
