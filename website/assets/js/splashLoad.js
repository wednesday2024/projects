

const splash = document.querySelector('.splash');

document.addEventListener('DOMContentLoaded', (e)=>{
	setTimeout(()=>{
		splash.classList.add('display-none');
	}, 2000);
})

 mainWindow.loadFile('index.html')
 mainWindow.center();