let output="";
function repeatStringNumTimes(str,num){
  if(num <= 0){
    return "";
  }
  else{
    
    for(let i=1;i<=num;i++){
         output += str
    }
    return output;
  }

}
console.log(repeatStringNumTimes("abc",4));