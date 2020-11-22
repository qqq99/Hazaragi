console.log("connected!")
var headOne = document.querySelector('#One')
headOne.addEventListener('mouseover', function() {
    headOne.textContent = 'come on haha!';
    headOne.style.color = 'grey'
})
headOne.addEventListener('mouseout', function() {
    headOne.textContent = 'Learn more about Mukhtar';
    headOne.style.color = '#fffafa'
})
var hh4 = document.querySelectorAll('h4');
var isPink = false;
for(var i = 0; i < hh4.length;i++)
{
  hh4[i].addEventListener("click",function()
  {
    if(isPink)
    {
      this.style.color = 'yellow';
      //isPink = false;
    }else
    {
      this.style.color = 'pink';
      //isPink = true;
    }
    isPink = !isPink;
  });
}
// for(var i = 0; i < hh4.length;i++)
// {
//   hh4[i].addEventListener("click",function()
//   {
//     this.classList.toggle('pink');
//   });
// }
