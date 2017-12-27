// Why does this file exist? See https://github.com/kozily/nearley-loader/issues/6

//https://stackoverflow.com/a/13647409/1412255
function removeLastLine(x) {
  if(x.lastIndexOf("\n")>0) {
      return x.substring(0, x.lastIndexOf("\n"));
  } else {
      return x;
  }
}

function removeLastNLines(x, n) {
  var result = x
  for (var i = 0; i < n; i++) result = removeLastLine(result);
  return result
}

// Identity loader with SourceMap support
module.exports = function(source, map) {
  const temp = removeLastNLines(source, 7) + "\n return grammar ;})();"
  const final = "export default " + temp
  this.callback(null, final, map);
};
