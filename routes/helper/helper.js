module.exports = {
  getDateTime: function() {
    var datetime = new Date();

    function pad2(n) {
      return (n < 10 ? "0" : "") + n;
    }

    var yyyy = pad2(datetime.getFullYear());
    var MM = pad2(datetime.getMonth() + 1);
    var DD = pad2(datetime.getDate());
    var HH = pad2(datetime.getHours());
    var mm = pad2(datetime.getMinutes());
    var ss = pad2(datetime.getSeconds());

    return `${yyyy}${MM}${DD}${HH}${mm}${ss}`;
  }
};
