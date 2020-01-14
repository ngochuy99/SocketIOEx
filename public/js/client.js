function HasUsermedia(){
   return !!(navigator.getUserMedia);
}
if(HasUsermedia()){
   navigator.getUserMedia({video:true,audio:true},function(s){
      video =s;
      var stream=document.querySelector(".stream") ;    //get the first element has class=stream
      stream.srcObject=s
   },function(err){
      throw err;
   })
}
else{
   alert('Not supported!')
}