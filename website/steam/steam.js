/*
	this is all the stuff not included in the web version
	lets us communicate with start.js
*/

let sendCallbacks={};
let sendCallbacksN=1;
let send=(data,callback)=>
{
	if (callback)
	{
		if (typeof data==='string') data={id:data,callback:sendCallbacksN};
		else data.callback=sendCallbacksN;
		sendCallbacks[sendCallbacksN]=callback;
		sendCallbacksN++;
	}
	window.api.send('toMain',data);
}
let subscribedGets={};
let onGet=(what,func)=>
{
	subscribedGets[what]=func;
}
window.api.receive('fromMain',(mes)=>{
	//console.log('message:',mes);
	if (mes && mes.callback && sendCallbacks[mes.callback]) {sendCallbacks[mes.callback](mes.data);sendCallbacks[mes.callback]=0;}
	if (mes && mes.id && subscribedGets[mes.id]) subscribedGets[mes.id](mes.data);
});

onGet('electron error',(err)=>{
	console.log(err);
	if (!Game || !Game.Notify) l('offGameMessage').innerText='Error: '+err;
	else Game.Notify('<span class="warning">Electron error</span>','<span class="warning">'+err+'</span>',[32,17]);
});

function formatBytes(a,b=2,k=1024){with(Math){let d=floor(log(a)/log(k));return 0==a?"0b":parseFloat((a/pow(k,d)).toFixed(max(0,b)))+""+["b","KB","MB","GB","TB","PB","EB","ZB","YB"][d]}}


showAds=false;
Music=false;
WindowFocus=true;

Steam={};
App=Steam;
Steam.reload=(args)=>{
	if (!args) send('reload');
	else send({id:'reload',...args});
};
Steam.quit=()=>{send('quit');};
Steam.save=(str)=>{
	//save to cloud and local
	Game.isSaving=true;
	Promise.all([
		new Promise((win,fail)=>{send({id:'save',data:str},win);}),
		new Promise((win,fail)=>{if (Game.prefs.cloudSave) send({id:'cloud save',/*name:'save_'+Date.now(),*/data:str},win); else win();}),
	])
	.then(()=>{
		Game.isSaving=false;
	});
};
Steam.load=(callback)=>{send({id:'cloud read'/*,name:'save'*/},callback);};//load from cloud
Steam.purgeCloud=()=>{send('cloud purge');};
Steam.writeCloudUI=()=>{
	return '<div class="listing" style="margin-bottom:-8px;">'+Game.WritePrefButton('cloudSave','cloudSaveButton',loc("Cloud saving")+ON,loc("Cloud saving")+OFF,'')+'<label>('+loc("allow use of Steam Cloud for save backups")+')</label></div><div id="cloudIsOn" class="listing" style="display:'+(Steam.cloud?'inline-block':'none')+';"><a class="option" style="font-size:11px;margin-left:12px;" '+Game.clickStr+'="Steam.purgeCloud();PlaySound(\'snd/tick.mp3\');">'+loc("Purge Cloud")+'</a><label>'+loc("Current Cloud use:")+' <b>'+Steam.cloudQuota+'</b></label></div><div id="cloudIsOff" class="listing" style="display:'+(!Steam.cloud?'inline-block':'none')+';font-size:11px;margin-left:12px;color:#c00;">'+loc("No Cloud access at the moment.")+'</div>'
	+'<div class="listing">'+Game.WritePrefButton('discordPresence','discordPresenceButton',loc("Discord status")+ON,loc("Discord status")+OFF,'Steam.toggleRichPresence(Game.prefs.discordPresence);')+'<label>('+loc("if Discord is on, show your game info as activity status")+')</label></div>';
};
Steam.toggleRichPresence=function(val)
{
	send({id:'toggle presence',val:val});
}

let analyzeSaveData=function(data)
{
	if (!data || data=='') return false;
	var str=unescape(data);
	var version=0;
	str=str.split('!END!')[0];
	str=b64_to_utf8(str);
	if (!str || str=='' || str.length<5) return false;
	var spl='';
	str=str.split('|');
	version=parseFloat(str[0]);
	if (isNaN(version) || version<0/* || version>Game.version*/) return false;
	
	spl=str[2].split(';');
	let startDate=parseInt(spl[1]);
	let lastDate=parseInt(spl[2]);
	spl=str[4].split(';');
	let cookiesEarned=parseFloat(spl[1]);
	let cookiesReset=spl[8]?parseFloat(spl[8]):0;
	let cookiesTotal=cookiesEarned+cookiesReset;
	spl=(str[9]||'').split(';');
	let modMeta=spl.find(it=>it.indexOf('META:')==0);
		if (modMeta && modMeta.split(':')[1].length>0) modMeta=modMeta.split(':')[1].split(','); else modMeta=[];
	return {startDate,lastDate,cookiesTotal,modMeta};
}
Steam.getMostRecentSave=(callback)=>{
	//we compare dates and total cookies between cloud and local saves
	//(local save is either the file at /save/save.cki or, if that's missing, localstorage)
	//if saves have the same start date and one save has at least 5% more total cookies than the other, load that one; else load the most recent
	Steam.load(async (cloud)=>{
		let loadType='local file';
		let local=await new Promise((resolve,reject)=>{
			let timer=setTimeout(reject,5000);//give up after 5 seconds
			send('load',(out)=>{clearTimeout(timer);resolve(out);});
		});
		if (!local) {local=localStorageGet(Game.SaveTo);loadType='localStorage';}
		let localStats=analyzeSaveData(local||'');
		let cloudStats=analyzeSaveData(cloud||'');
		let data='';
		if (!localStats) local=0;
		if (!cloudStats) cloud=0;
		if (!local && !cloud) {loadType='none';}
		else if (!local && cloud) data=cloud; else if (!cloud && local) data=local;
		else if (localStats.startDate==cloudStats.startDate && cloudStats.cookiesTotal>=localStats.cookiesTotal*1.05) {data=cloud;loadType='cloud';} else if (localStats.startDate==cloudStats.startDate && localStats.cookiesTotal>=cloudStats.cookiesTotal*1.05) data=local;
		else if (cloudStats.lastDate>localStats.lastDate) {data=cloud;loadType='cloud';} else data=local;
		
		console.log('loading save from:',loadType);
		
		callback(data);
	});
};
Steam.justLoadedSave=()=>{
	if (Game.loadedFromVersion!=Game.version)
	{
		send('backup');
		var old=localStorageGet(Game.SaveTo);
		if (old) localStorageSet(Game.SaveTo+'Old',old);
	}
	Steam.toggleRichPresence(Game.prefs.discordPresence);
	//if (Game.HasAchiev('Cheated cookies taste awful')) Steam.allowSteamAchievs=false;
	if (!Steam.allowSteamAchievs) return false;
	let list=[];
	for (let i in Game.Achievements)
	{
		let it=Game.Achievements[i];
		if (it.won && it.vanilla) list.push(it.id==0?'zero':it.id);
	}
	if (list.length>0) send({id:'get achievs',list:list});
};
Steam.restoreBackup=async ()=>{
	//note: you may trigger this by naming yourself "RESTORE BACKUP". will try to load the local file "OLDsave.cki" (or associated localstorage) without conflicts, if it exists.
	let data=await new Promise((resolve,reject)=>{
			let timer=setTimeout(reject,5000);//give up after 5 seconds
			send({id:'load',backup:true},(out)=>{clearTimeout(timer);resolve(out);});
		});
	if (!data) data=localStorageGet(Game.SaveTo+'Old');
	if (data) Game.LoadSave(data,true);
};
Steam.hardSave=(save)=>{
	//just raw-save the data to disk and cloud without passing by Game.WriteSave()
	if (Game.useLocalStorage) localStorageSet(Game.SaveTo,save);
	Steam.save(save);
};
Steam.onImportSave=(out,save)=>{
	if (!out) return false;
	Steam.hardSave(save);
	Game.toReload=true;
};
Steam.grabData=(callback)=>{
	send('get playersN',(res)=>{callback({playersN:parseInt(res.playersN||1)});});
};
Steam.gotAchiev=(id)=>{
	if (!Steam.allowSteamAchievs) return false;
	send({id:'get achiev',achiev:id==0?'zero':id});
};
Steam.resetAchievs=()=>{
	send('reset achievs');
};
Steam.hardReset=()=>{
	send('hard reset');
};
Steam.ping=(mes)=>{send({id:'ping',mes:mes||0},(rep)=>{console.log('got a pong reply:',rep);});};

Steam.openLink=(url)=>{
	send({id:'url',url:url||0});
};

Steam.setFullscreen=(val)=>{
	send({id:'fullscreen',on:val});
};

Steam.cloud=false;
Steam.cloudQuota='?';


Steam.writeModUI=()=>
{
	let str=`<div style="text-align:center;">
		<a style="text-align:center;margin:4px;" class="option smallFancyButton" ${Game.clickStr}="Steam.modsPopup();PlaySound('snd/tick.mp3');">${loc("Manage mods")}</a>
		<a style="text-align:center;margin:4px;" class="option smallFancyButton" ${Game.clickStr}="Game.CheckModData();PlaySound(\'snd/tick.mp3\');">${loc("Check mod data")}</a>
		<a style="text-align:center;margin:4px;" class="option smallFancyButton" ${Game.clickStr}="Steam.workshopPopup();PlaySound('snd/tick.mp3');">${loc("Publish mods")}</a>
	</div>`;
	return str;
}
Steam.modsPopup=function()
{
	let selectedMod=0;
	
	let mods=[];
	for (var i=0;i<Steam.modList.length;i++)
	{
		if (!Steam.mods[Steam.modList[i]]) continue;
		let mod=Steam.mods[Steam.modList[i]];
		let obj={};
		obj.name=mod.info.Name;
		obj.desc=mod.info.Description||0;
		obj.loc=mod.dir;
		obj.id=mod.id;
		obj.i=i;
		obj.dependencies=mod.dependencies;
		obj.workshop=mod.workshop;
		obj.disabled=mod.disabled;
		mods.push(obj);
	}
	
	let checkModDependencies=(mod)=>{
		let okay=true;
		mod.dependenciesStr=0;
		let loadedMods=[];
		for (var i=0;i<mod.i;i++)
		{
			if (!mods[i].disabled) loadedMods.push(mods[i].id);
		}
		if (mod.dependencies.length>0)
		{
			mod.dependenciesStr=[];
			for (let ii=0;ii<mod.dependencies.length;ii++)
			{
				if (loadedMods.includes(mod.dependencies[ii])) mod.dependenciesStr.push(`<div class="tag">${mod.dependencies[ii]}</div>`);
				else {mod.dependenciesStr.push(`<div class="tag pucker" style="background:#f00;">${mod.dependencies[ii]}</div>`);mod.disabled=true;okay=false;}
			}
			mod.dependenciesStr=mod.dependenciesStr.join(' ');
		}
		return okay;
	}
	
	let changeMods=()=>{l('promptOption0').style.display='inline-block';}
	let updateModList=()=>
	{
		let el=l('modList');if (!el) return false;
		
		let str='';
		
		for (let i=0;i<mods.length;i++)
		{
			let mod=mods[i];
			mod.i=i;
			checkModDependencies(mod);
			str+=`<div class="zebra mouseOver${mod==selectedMod?' selected pucker':''}" style="padding:4px;${mod.disabled?'opacity:0.5;background:rgba(255,0,0,0.2);':''}" id="mod-${i}"><b id="mod-name-${i}"></b></div>`;
		}
		el.innerHTML=str;
		for (let i=0;i<mods.length;i++)
		{
			let mod=mods[i];
			l('mod-name-'+i).textContent=mod.name;
			AddEvent(l('mod-'+i),'click',()=>{PlaySound('snd/tick.mp3');selectedMod=(selectedMod==mod?0:mod);updateModList();});
		}
		updateModOptions();
	}
	let updateModOptions=()=>
	{
		let el=l('modOptions');if (!el) return false;
		
		if (selectedMod)
		{
			let mod=selectedMod;
			checkModDependencies(mod);
			el.innerHTML=`
				<div class="name" id="modName"></div>
				<div id="modId" class="tag"></div>
				<div class="line"></div>
				<a class="option" id="modDisable" ${Game.clickStr}="PlaySound('snd/tick.mp3');">${mod.disabled?loc("Enable"):loc("Disable")}</a>
				<a class="halfLeft option${mods.indexOf(mod)==0?' off':''}" id="modPUp" ${Game.clickStr}="PlaySound('snd/tick.mp3');">${loc("Priority up")}</a>
				<a class="halfRight option${mods.indexOf(mod)==mods.length-1?' off':''}" id="modPDown" ${Game.clickStr}="PlaySound('snd/tick.mp3');">${loc("Priority down")}</a>
				`+(mod.loc?`<a class="option" id="modOpenFolder" ${Game.clickStr}="PlaySound('snd/tick.mp3');">${loc("Open folder")}</a>`:'')+`
				${mod.desc?'<textarea readonly id="modDesc" style="margin:4px;padding:4px 8px;width:80%;box-sizing:border-box;height:80px;font-size:11px;"></textarea>':''}
				<div class="line" style="clear:both;"></div>
				`+(mod.workshop?`
					<a class="option" id="modOpenWorkshop" ${Game.clickStr}="PlaySound('snd/tick.mp3');">${loc("Open Workshop page")}</a>
					<a class="option" id="modUnsubscribeWorkshop" ${Game.clickStr}="PlaySound('snd/tick.mp3');">${loc("Unsubscribe")}</a>
				`:`<div style="opacity:0.5;margin:4px;">${loc("Local mod")}</div>`)+`
				`+(mod.dependenciesStr?`
					<div style="margin:4px;"><span style="opacity:0.5;">${loc("Dependencies")} - </span>${mod.dependenciesStr}</div>
				`:``)+`
			`;
			AddEvent(l('modDisable'),'click',()=>{if (!checkModDependencies(mod)){updateModOptions();return false;}changeMods();mod.disabled=!mod.disabled;updateModList();});
			AddEvent(l('modPUp'),'click',()=>{if (mods.indexOf(mod)==0){return false;}changeMods();mods.splice(mods.indexOf(mod)-1,0,mods.splice(mods.indexOf(mod),1)[0]);updateModList();});
			AddEvent(l('modPDown'),'click',()=>{if (mods.indexOf(mod)==mods.length-1){return false;}changeMods();mods.splice(mods.indexOf(mod)+1,0,mods.splice(mods.indexOf(mod),1)[0]);updateModList();});
			l('modName').textContent=mod.name||'(untitled mod)';
			l('modId').textContent=mod.id?('ID: '+mod.id):'';
			if (mod.desc) l('modDesc').textContent=mod.desc;
			if (mod.loc) AddEvent(l('modOpenFolder'),'click',()=>{send({id:'open folder',loc:mod.loc});});
			if (mod.workshop)
			{
				AddEvent(l('modOpenWorkshop'),'click',()=>{send({id:'open workshop',loc:mod.workshop});});
				AddEvent(l('modUnsubscribeWorkshop'),'click',()=>{l('modUnsubscribeWorkshop').style.cssText='opacity:0.5;pointer-events:none;';send({id:'unsubscribe workshop',loc:mod.workshop,dir:Steam.mods[mod.id].dir},async (response)=>{
					if (response==true)
					{
						mods.splice(mods.indexOf(mod),1);
						selectedMod=0;
						changeMods();
						updateModList();
					}
				});});
			}
		}
		else el.innerHTML=loc("Select a mod.");
	}
	Game.Prompt(`<id ManageMods>
		<h3>${loc("Manage mods")}</h3>
		<div class="line"></div>
		<div style="overflow:hidden;clear:both;"><a class="option" style="float:left;" id="openModsFolder" ${Game.clickStr}="PlaySound('snd/tick.mp3');">${loc("Open %1 folder",'/mods')}</a><a class="option" style="float:right;" id="openWorkshop" ${Game.clickStr}="PlaySound('snd/tick.mp3');">${loc("Open Workshop")}</a></div>
		<div style="font-size:11px;opacity:0.7;">${loc("Mods are loaded from top to bottom.")}</div>
		<div class="line"></div>
		<div style="height:300px;width:100%;position:relative;margin:12px 0px;">
			<div class="inner" style="font-size:11px;height:100%;width:50%;overflow-x:hidden;overflow-y:scroll;position:absolute;left:0px;" id="modList"></div>
			<div class="tight" style="font-size:11px;height:100%;width:50%;overflow-x:hidden;overflow-y:auto;position:absolute;right:0px;padding-left:10px;" id="modOptions"></div>
		</div>
	`,[[loc("Restart with new changes"),0,'display:none;'],loc("Back")],0,'widePrompt');
	updateModList();
	AddEvent(l('openModsFolder'),'click',()=>{send({id:'open folder',loc:'DIR/mods'});});
	AddEvent(l('openWorkshop'),'click',()=>{send({id:'open workshop'});});
	AddEvent(l('promptOption0'),'click',()=>{
		Steam.modList=mods.map(mod=>(mod.id));
		for (var i=0;i<mods.length;i++)
		{
			if (Steam.mods[mods[i].id]) Steam.mods[mods[i].id].disabled=mods[i].disabled;
		}
		Game.toSave=true;
		Game.toReload=true;
	});
}
Steam.workshopPopup=function()
{
	let selectedMod=0;
	let selectedModPath=0;
	let error=0;
	
	let updatePublishedModsPopup=()=>
	{
		Game.Prompt(`<id UpdateMods>
			<h3>${loc("Update published mods")}</h3>
			<div class="line"></div>
			<div style="font-size:11px;">You may upload updated folders for your published mods here.<br>To edit a mod's name/description/gallery, please use its Workshop page instead.<br>Your mod's thumbnail will also be updated if your folder includes<br>an image named "thumbnail.png" under 1MB.</div>
			<a class="option" style="display:block;" id="modRefresh" ${Game.clickStr}="PlaySound('snd/tick.mp3');">${loc("Refresh")}</a>
			<div id="modDisplay" style="height:250px;overflow-y:scroll;"></div>
			<div class="line"></div>
		`,[[loc("Back"),'Steam.workshopPopup();']],0,'widePrompt');
		
		AddEvent(l('modRefresh'),'click',()=>{updatePublishedModsPopup();});
		
		send({id:'get published mods'},async (response)=>{
			if (response && response.list)
			{
				let str=``;
				for (let i=0;i<response.list.length;i++)
				{
					let me=response.list[i];
					str+=`<div class="block mouseOver" style="clear:both;text-align:left;overflow:hidden;font-size:11px;padding:2px 4px;">
						<a class="option" style="float:left;display:block;" id="modOpenWorkshop-${i}" ${Game.clickStr}="PlaySound('snd/tick.mp3');">${loc("Open Workshop page")}</a>
						<div style="float:right;opacity:0.7;">Last updated: ${new Date(me.timeUpdated*1000).toLocaleString([],{year:"numeric",month:"2-digit",day:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
						<div style="clear:both;"></div>
						<div style="text-align:left;float:left;width:60%;/*padding-left:70px;*/position:relative;box-sizing:border-box;">
							<!--<img class="framed" style="width:60px;height:60px;margin:0px;padding:0px;position:absolute;left:0px;pointer-events:none;"/>-->
							<input readonly class="tightInput" style="font-weight:bold;" type="text" id="modName-${i}"/>
							<textarea readonly class="tightInput" id="modDesc-${i}" style="height:40px;"></textarea>
						</div>
						<div style="text-align:center;float:right;width:35%;">
							<a class="option" style="display:block;" id="selectNewModFolder-${i}" ${Game.clickStr}="PlaySound('snd/tick.mp3');">${loc("Select updated folder")}</a>
							<a class="option" style="display:none;" id="publishUpdatedMod-${i}" ${Game.clickStr}="PlaySound('snd/tick.mp3');">${loc("Publish to Workshop")}</a>
							<div style="font-size:11px;font-weight:bold;" id="modPublishProgress-${i}"></div>
						</div>
					</div>`;
				}
				l('modDisplay').innerHTML=str;
				for (let i=0;i<response.list.length;i++)
				{
					let me=response.list[i];
					me.mod=0;
					l(`modName-${i}`).value=me.title;
					l(`modDesc-${i}`).value=me.description;
					/*if (me.previewFileSize>0)
					{
						send({id:'get server image',handle:me.previewFile},async (response)=>{
							console.log('image:',response);
						});
					}*/
					AddEvent(l(`modOpenWorkshop-${i}`),'click',()=>{send({id:'open workshop',loc:me.publishedFileId});});
					
					AddEvent(l(`selectNewModFolder-${i}`),'click',()=>{send({id:'select folder',loc:'DIR/mods'},async (response)=>{
						if (response){
							send({id:'select mod',loc:response[0]},async (response)=>{
								if (response && response.error){me.mod=0;l(`modPublishProgress-${i}`).innerHTML=`<span class="warning">${loc("Error!")} ${response.error}</span>`;l(`publishUpdatedMod-${i}`).style.display='none';}
								else if (response){me.mod=response;l(`modPublishProgress-${i}`).innerHTML=``;l(`publishUpdatedMod-${i}`).style.display='block';}
							});
						}
					})});
					AddEvent(l(`publishUpdatedMod-${i}`),'click',()=>{
						l(`selectNewModFolder-${i}`).style.display='none';
						l(`publishUpdatedMod-${i}`).style.display='none';
						l(`modPublishProgress-${i}`).innerHTML=loc("Publishing...");
						send({id:'publish mod',mod:me.mod,update:me.publishedFileId},async (response)=>{
							if (response && response.success)
							{
								l(`modPublishProgress-${i}`).innerHTML=`<span style="color:#3f3;">${loc("Success!")}</span>`;
								l(`selectNewModFolder-${i}`).style.display='block';
							}
							else
							{
								l(`modPublishProgress-${i}`).innerHTML=`<span class="warning">${loc("Error!")}</span>`;
								l(`selectNewModFolder-${i}`).style.display='block';
								l(`publishUpdatedMod-${i}`).style.display='block';
							}
						});
					});
				}
			}
			else l('modDisplay').innerHTML=`<div style="font-size:11px;margin:8px;">(${loc("none")})</div>`;
		});
	}
	
	let updateModDisplay=()=>
	{
		let el=l('modDisplay');if (!el) return false;
		
		let str='';
		if (selectedMod)
		{
			let mod=selectedMod||{};
			str=`
			<div style="height:250px;width:100%;position:relative;margin:0px;font-size:11px;">
				<div class="tight" style="text-align:left;height:100%;width:50%;overflow-x:hidden;overflow-y:auto;position:absolute;left:0px;padding-right:10px;">
					<div>ID: <div id="modID" class="tag" style="font-weight:bold;"></div></div>
					<div>${loc("Name")}:</div>
						<input readonly class="tightInput" type="text" id="modName"/>
					<div>${loc("Description")}:</div>
						<textarea readonly class="tightInput" id="modDesc" style="height:80px;"></textarea>
					<div>${loc("Dependencies")}:</div>
						<div id="modDeps" style="margin-left:8px;font-weight:bold;"></div>
				</div>
				<div class="tight" style="text-align:right;height:100%;width:50%;overflow-x:hidden;overflow-y:auto;position:absolute;right:0px;padding-left:10px;">
					<!--<div>Tags: (separated by commas)</div>
						<input readonly class="tightInput" type="text" id="modTags"/>-->
					<img id="modImg" class="framed" src="" style="float:right;pointer-events:none;display:none;margin:0px;padding:0px;max-height:200px;max-width:200px;height:auto;width:auto;"/>
					<div id="modImgSize" class="warning" style="font-weight:bold;"></div>
				</div>
			</div>
			<div class="line"></div>
			<div style="text-align:center;font-weight:bold;" id="modPublishProgress"></div>
			<div id="modPublishButtons" style="clear:both;overflow:hidden;">
				<a class="option" style="float:left" id="modRefresh" ${Game.clickStr}="PlaySound('snd/tick.mp3');">${loc("Refresh")}</a>
				<a class="option" style="float:right;font-weight:bold;" id="uploadWorkshop" ${Game.clickStr}="PlaySound('snd/tick.mp3');">${loc("Publish to Workshop")}</a>
			</div>
			`;
			l('modDisplay').innerHTML=str;
			l('modName').value=mod.name||'(untitled mod)';
			l('modID').textContent=mod.id||'(unknown)';
			l('modDesc').value=mod.desc||'';
			l('modDeps').textContent=mod.dependencies.length>0?mod.dependencies.join(', '):loc("none");
			if (mod.img) {l('modImg').src=mod.img;l('modImg').style.display='block';}
			else if (mod.imgSize && mod.imgSize>=1) {l('modImgSize').textContent=loc("Image")+': '+(Math.ceil(mod.imgSize*10)/10)+'MB (>=1MB)';l('modImgSize').style.display='block';}
			l('promptOption0').style.display='inline-block';
			
			AddEvent(l('modRefresh'),'click',()=>{
				send({id:'select mod',loc:mod.path},async (response)=>{
					if (response && response.error){selectedMod=0;error=response.error;updateModDisplay();}
					else if (response){selectedMod=response;updateModDisplay();}
				});
			});
			AddEvent(l('uploadWorkshop'),'click',()=>{
				l('modPublishButtons').style.display='none';
				l('modPublishProgress').innerHTML=loc("Publishing...");
				send({id:'publish mod',mod:mod},async (response)=>{
					if (response && response.success && response.out)
					{
						l('modPublishProgress').innerHTML=`<span style="color:#3f3;">${loc("Success!")}</span> <a class="option" id="modOpenWorkshop" ${Game.clickStr}="PlaySound('snd/tick.mp3');">${loc("Open Workshop page")}</a>`;
						AddEvent(l('modOpenWorkshop'),'click',()=>{send({id:'open workshop',loc:response.out});});
					}
					else
					{
						l('modPublishProgress').innerHTML=`<span class="warning">${loc("Error!")}</span>`;
						l('modPublishButtons').style.display='block';
					}
				});
			});
		}
		else
		{
			l('promptOption0').style.display='none';
			if (error)
			{
				str+=`<div class="warning" style="font-weight:bold;font-size:11px;padding:8px;">${loc("Error!")} ${error}</div>`;
			}
			error=0;
			
			str+=`
			<div style="font-size:11px;">
				${tinyIcon([16,5])}<div></div>
				${loc("This tool allows you to upload new mods to the Steam Workshop.<br>You need to select a mod folder containing a properly-formatted %1 file.<br>See the included sample mods for examples.",'<b>info.txt</b>')}
			</div>
			<div class="line"></div>
			<div style="overflow:hidden;clear:both;">
				<a class="option" id="selectModFolder" style="display:block;font-weight:bold;" ${Game.clickStr}="PlaySound('snd/tick.mp3');">${loc("New mod")} - ${loc("Select folder")}</a>
				<a class="option" id="updatePublishedMods" style="display:block;font-weight:bold;" ${Game.clickStr}="PlaySound('snd/tick.mp3');">${loc("Update published mods")}...</a>
			</div>`;
			l('modDisplay').innerHTML=str;
			
			AddEvent(l('selectModFolder'),'click',()=>{send({id:'select folder',loc:'DIR/mods'},async (response)=>{
				if (response){
					selectedModPath=response[0];
					send({id:'select mod',loc:selectedModPath},async (response)=>{
						if (response && response.error){selectedMod=0;error=response.error;updateModDisplay();}
						else if (response){selectedMod=response;updateModDisplay();}
					});
				}
			})});
			AddEvent(l('updatePublishedMods'),'click',()=>{updatePublishedModsPopup();});
	
		}
		Game.UpdatePrompt();
	}
	
	Game.Prompt(`<id PublishMods>
		<h3>${loc("Publish mods")}</h3>
		<div class="line"></div>
		<div class="block" id="modDisplay"></div>
	`,[[loc("Back"),'Steam.workshopPopup();','display:none;'],loc("Cancel")],0,'widePrompt');
	updateModDisplay();
}


Steam.allowSteamAchievs=true;

Steam.mods={};//backend-side representation of the mods; distinct from Game.mods
Steam.modList=[];//array of mod IDs, used for load order
Steam.loadMods=async function(callback)
{
	await InitBridge();
	
	console.log('syncing mods...');
	let subscribedMods=await new Promise((resolve,reject)=>{
		let timer=setTimeout(resolve,60*1000);//give up after a minute
		send('sync mods',(out)=>{clearTimeout(timer);resolve(out);});
    });
	if (typeof subscribedMods!=='string') console.log('synced mods:',subscribedMods);
	else console.log('failed to sync mods:',subscribedMods);
	
	console.log('loading mods...');
	
	Game.mods={};
	Game.sortedMods=[];
	Game.brokenMods=[];
	Game.modSaveData={};
	Game.modHooks={};
	for (var i=0;i<Game.modHooksNames.length;i++){Game.modHooks[Game.modHooksNames[i]]=[];}
	
	send('load mods',async (mods)=>{
		
		//sort mod order
		//annoying that we have to get the save data just for this, but ehh
		Steam.modList=await new Promise((resolve,reject)=>{
			Steam.getMostRecentSave((data)=>{resolve(analyzeSaveData(data).modMeta);});
		});
		if (!Steam.modList) Steam.modList=[];
		
		for (let i=0;i<mods.length;i++)
		{
			let mod=mods[i];
			if (!mod.info) Game.brokenMods.push(mod.path);
		}
		mods=mods.filter(it=>it.info);
		
		for (let i=0;i<mods.length;i++)
		{
			let mod=mods[i];
			if (Steam.modList.includes('*'+mod.id)) {mod.disabled=true;Steam.modList.splice(Steam.modList.indexOf('*'+mod.id),1,mod.id);}
			else if (Steam.modList.includes(mod.id)) {mod.disabled=false;}
			else Steam.modList.push(mod.id);//new mods get pushed to the bottom
		}
		
		mods.sort(function(a,b){  
			return Steam.modList.indexOf(a.id)-Steam.modList.indexOf(b.id);
		});
		
		let promises=[];
		let loadedMods=[];
		for (let i=0;i<mods.length;i++)
		{
			let mod=mods[i];
			Steam.mods[mod.id]=mod;
			if (Game.modless || !mod.dependencies.every(v=>loadedMods.includes(v))) mod.disabled=true;
			if (mod.disabled) continue;
			let file=mod.jsFile;
			if (file)
			{
				promises.push(new Promise((resolve,reject)=>{
					Game.LoadMod(file,resolve,()=>{console.log(`Failed to load mod file:`,file);resolve();});
				}));
				if (!mod.info.AllowSteamAchievs) Steam.allowSteamAchievs=false;
			}
			if (mod.info.LanguagePacks)
			{
				for (let ii in mod.info.LanguagePacks)
				{
					let file=mod.dir+'/'+mod.info.LanguagePacks[ii];
					promises.push(new Promise((resolve,reject)=>{
						LoadLang(file,resolve,()=>{console.log(`Failed to load mod language file:`,file);resolve();});
					}));
				}
			}
			loadedMods.push(mod.id);
			
		}
		Promise.all(promises)
		.then(()=>{
			console.log('loaded mods:',loadedMods.join(',')||'(none)');
			callback();
		});
	});
}
Steam.saveMods=function()
{
	//save mod order
	if (Steam.modList.length==0) return '';
	str='META:';
	for (var i=0;i<Steam.modList.length;i++)
	{
		if (!Steam.mods[Steam.modList[i]]) continue;
		str+=(Steam.mods[Steam.modList[i]].disabled?'*':'')+Steam.modList[i]+(i<Steam.modList.length-1?',':'');
	}
	str+=';'
	return str;
}
Steam.registerMod=function(mod)
{
	if (Steam.mods[mod.id])
	{
		let steamSide=Steam.mods[mod.id];
		mod.dir=steamSide.dir.replace(/\\/g,"/");
	}
}

Steam.logic=function(T)
{
	if (T>0 && T%(Game.fps*30)==29)//every 30 seconds
	{
		var arr=[];
		arr[0]=loc("%1 cookie",LBeautify(Game.cookies));
		arr[1]='('+(EN?'':(loc("per second:")+' '))+Beautify(Game.cookiesPs*(1-Game.cpsSucked),1)+(EN?' per second':'')+')';
		if (Game.prefs.discordPresence) send({id:'update presence',arr:arr});
	}
}

let timesLoaded=0;
let InitBridge=async function()
{
	let backendData=await new Promise((resolve,reject)=>{
		let timer=setTimeout(resolve,5000);//give up after 5 seconds
		send('init bridge',(out)=>{console.log('bridge open');clearTimeout(timer);resolve(out);});
    });
	let timesLoaded=backendData.timesLoaded;
	
	
	if (Game.beta) Steam.allowSteamAchievs=false;
	
	send('cloud check');
	
	onGet('log',(data)=>{console.log(data);});
	onGet('cloud on',()=>{Steam.cloud=true;});
	onGet('cloud off',()=>{Steam.cloud=false;});
	onGet('cloud quota',(data)=>{Steam.cloudQuota=formatBytes(data[0]-data[1])/*+'/'+formatBytes(data[0])*/;});
	onGet('cloud purge ok',()=>{Game.Notify(loc("Cloud purged."),'',0,3,true);});
	
	onGet('window focus',()=>{Game.keys=[];if (!WindowFocus && !Game.prefs.bgMusic){Music.setVolume(Game.volumeMusic/100,0.5);}WindowFocus=true;});
	onGet('window blur',()=>{Game.keys=[];if (WindowFocus && !Game.prefs.bgMusic){Music.setVolume(0,1);}WindowFocus=false;});
	onGet('overlay',(active)=>{Game.keys=[];});
	
	return true;
}

PRELOAD=function(callback){return async function(){
	
	//dark fade-in
	(function(){
		var css=document.createElement('style');
		css.type='text/css';
		css.innerHTML=`
			#darkOverlay,#darkOverlay2
			{
				position:absolute;
				left:0px;top:0px;right:0px;bottom:0px;
				padding:0px;margin:0px;
				background:#000;
				z-index:10000000000;
				animation:darkOverlayFade ${timesLoaded==1?'2':'0.2'}s ease-out;
				animation-fill-mode:both;
				opacity:0.5;
				pointer-events:none;
			}
			#darkOverlay2
			{
				background:#f60;
				mix-blend-mode:multiply;
				z-index:99;
			}
			
			@keyframes darkOverlayFade{
				0% {opacity:1;}
				50% {opacity:1;}
				100% {opacity:0;}
			}
		`;
		document.head.appendChild(css);
		let darken=document.createElement('div');
		darken.innerHTML='<div id="darkOverlay"></div><div id="darkOverlay2"></div>';
		document.body.appendChild(darken);
		setTimeout(()=>{darken.parentNode.removeChild(darken);},3000);
	})();
	
	
	var initMusic=function()
	{
		AudioContext=new (window.AudioContext || window.webkitAudioContext)();
		if (AudioContext)
		{
			Music={};
			Music.context=AudioContext;
			Music.tracks={};
			
			//node stack
			Music.gain=new GainNode(Music.context,{gain:1});
			Music.gain.connect(Music.context.destination);
			Music.filter=new BiquadFilterNode(Music.context,{type:'lowpass',Q:0});
			Music.filter.frequency.setValueAtTime(5000,Music.context.currentTime);
			Music.filter.connect(Music.gain);
			Music.out=Music.filter;
			
			Music.setFilter=function(val,secs)
			{
				//val=1: no effect
				//val=0: full lowpass
				//secs: ramp over how many seconds
				var minValue=40;
				var maxValue=Music.context.sampleRate/2;
				var numberOfOctaves=Math.log(maxValue/minValue)/Math.LN2;
				var multiplier=Math.pow(2,numberOfOctaves*(val-1.0));
				Music.filter.frequency.cancelScheduledValues(Music.context.currentTime);
				if (secs)
				{
					Music.filter.frequency.setValueAtTime(Music.filter.frequency.value,Music.context.currentTime);
					Music.filter.frequency.exponentialRampToValueAtTime(maxValue*multiplier,Music.context.currentTime+secs);
				}
				else Music.filter.frequency.setValueAtTime(maxValue*multiplier,Music.context.currentTime);
			}
			Music.setFilter(1);
			
			Music.setVolume=function(val,secs)
			{
				//val=1: full volume
				//val=0: silent
				//secs: ramp over how many seconds
				val*=0.75;
				Music.gain.gain.cancelScheduledValues(Music.context.currentTime);
				if (secs)
				{
					if (val<=0)
					{
						val=0.00001;
					}
					Music.gain.gain.setValueAtTime(Music.gain.gain.value,Music.context.currentTime);
					Music.gain.gain.exponentialRampToValueAtTime(val,Music.context.currentTime+secs);
				}
				else Music.gain.gain.setValueAtTime(val,Music.context.currentTime);
			}
			
			Music.addTrack=function(name,author,url)
			{
				if (!Music.tracks[name])
				{
					Music.tracks[name]={
						audio:new Audio(),
						canPlay:false,
						name:name,
						author:author,
					};
					var track=Music.tracks[name];
					track.out=Music.context.createMediaElementSource(track.audio);
					track.audio.autoplay=false;
					track.audio.crossOrigin='anonymous';
					track.audio.src=url;
					track.audio.track=track;
					track.play=function(){
						this.out.connect(Music.out);
						this.audio.currentTime=0;
						this.audio.loop=false;
						this.audio.play();
					};
					track.stop=function(){
						//this.out.disconnect(Music.out);
						this.audio.pause();
					};
					track.unstop=function(){
						this.out.connect(Music.out);
						this.audio.play();
					};
					AddEvent(track.audio,'canplay',function(it){
						it.target.track.canPlay=true;
					});
				}
			}
			
			//note: may trigger CORS locally
			Music.addTrack('preclick','C418','music/preclick.mp3');
			Music.addTrack('click','C418','music/click.mp3');
			Music.addTrack('grandmapocalypse','C418','music/grandmapocalypse.mp3');
			Music.addTrack('ascend','C418','music/ascend.mp3');
			
			Music.cues={
				'launch':()=>{Music.setFilter(0);setTimeout(()=>{Music.loopTrack('preclick');Music.setFilter(1,5);},1000);},
				'preplay':()=>{Music.setFilter(0.5,0.1);setTimeout(()=>{Music.cue('play');Music.setFilter(1,0.1);},100);},
				'play':()=>{if (Game.elderWrath<3){Music.loopTrack('click');Music.setFilter(1);} else {Music.cue('grandmapocalypse');}},
				'grandmapocalypse':()=>{Music.loopTrack('grandmapocalypse');Music.setFilter(1);},
				'fadeTo':(what)=>{
					if (Music.playing && Music.playing.name==what) return false;
					Music.setFilter(0,3);
					setTimeout(()=>{
						var prev=Music.playing?Music.playing.audio.currentTime:0;
						Music.setFilter(0);
						Music.setFilter(1,3);
						Music.loopTrack(what);
						Music.playing.audio.currentTime=prev%(1*4);//preserve bpm and bar
					},3000);
				},
				'preascend':()=>{Music.setFilter(0,3);},
				'ascend':()=>{Music.loopTrack('ascend');Music.setFilter(1);Music.playing.audio.currentTime=(Game.resets%2==0?0:175.95);},
			};
			
			Music.cue=function(cue,arg)
			{
				if (Music.cues[cue]) Music.cues[cue](arg);
			}
			
			Music.playing=false;
			Music.playTrack=function(name,callback)
			{
				var track=Music.tracks[name];
				if (!track) return false;
				if (Music.playing) Music.playing.stop();//todo: fade out
				Music.playing=track;
				if (track.canPlay) {track.play();track.audio.loop=false;if (callback){callback(track);}}
				else
				{
					AddEvent(track.audio,'canplay',function(it){
						if (it.target.track==Music.playing) {it.target.track.play();if (callback){callback(it.target.track);}}
					});
				}
				if (Game.jukebox) Game.jukebox.setTrack(Game.jukebox.tracks.indexOf(name),true);
				return true;
			}
			Music.loopTrack=function(name)
			{
				Music.playTrack(name,(track)=>{track.audio.loop=true;});
			}
			
			Music.pause=function()
			{
				if (Music.playing) Music.playing.stop();
			}
			Music.unpause=function()
			{
				if (Music.playing) Music.playing.unstop();
			}
			Music.loop=function(val)
			{
				if (Music.playing) Music.playing.audio.loop=val;
			}
			Music.setTime=function(val)
			{
				if (Music.playing) Music.playing.currentTime=val;
			}
			
			//Music.playTrack('click');
		}
	}
	
	
	//add 2 one-pixel-wide canvases on either side of the screen to counteract Steam overlay flicker
	let antiflickerCanvasL=document.createElement('canvas');
		antiflickerCanvasL.height=window.innerHeight;
		antiflickerCanvasL.width=1;
		antiflickerCanvasL.style.cssText='opacity:0.01;position:absolute;left:0px;top:0px;bottom:0px;width:1px;z-index:10000000;pointer-events:none;';
		let antiflickerCanvasLctx=antiflickerCanvasL.getContext('2d',{alpha:false});
	let antiflickerCanvasR=document.createElement('canvas');
		antiflickerCanvasR.height=window.innerHeight;
		antiflickerCanvasR.width=1;
		antiflickerCanvasR.style.cssText='opacity:0.01;position:absolute;right:0px;top:0px;bottom:0px;width:1px;z-index:10000000;pointer-events:none;';
		let antiflickerCanvasRctx=antiflickerCanvasR.getContext('2d',{alpha:false});
	document.body.appendChild(antiflickerCanvasL);
	document.body.appendChild(antiflickerCanvasR);
	let refreshEveryFrame=function()
	{
		antiflickerCanvasLctx.fillStyle='#000';
		antiflickerCanvasLctx.fillRect(0,0,1,Game.windowH);
		antiflickerCanvasRctx.fillStyle='#000';
		antiflickerCanvasRctx.fillRect(0,0,1,Game.windowH);
		requestAnimationFrame(refreshEveryFrame);
	}
	requestAnimationFrame(refreshEveryFrame);
	Steam.onResize=()=>
	{
		var height=window.innerHeight;
		antiflickerCanvasL.height=height;
		antiflickerCanvasR.height=height;
	}
	
	/*if (!App)
	{
		Game.firstClick=false;
		AddEvent(window,'click',function(initMusic){return function(){
			if (Game.firstClick) return;
			Game.firstClick=true;
			initMusic();
		}}(initMusic));
	}
	else */initMusic();
	
	setTimeout(()=>{Steam.toggleRichPresence(Game.prefs.discordPresence);},1000*5);
	
	
	//handle errors, likely in mods
	let onRuntimeError=function(e)
	{
		var stack=0;
		if (e.stack) stack=e.stack;
		else if (e.reason && e.reason.stack) stack=e.reason.stack;
		if (stack)
		{
			var str='';
			
			var paths=stack.match(/\(([^\)]+)\)/gi);
			var modPath=paths.filter(it=>it.indexOf('/mods/')!=-1);
			var srcPath=paths.filter(it=>it.indexOf('/src/')!=-1);
			if (modPath.length>0)
			{
				var path=modPath[0].slice(1,-1);
				path=path.substring(path.indexOf('/mods/'));
				str+=`Error in mod script:<br><b>${path}</b><br>Try disabling the relevant mod.`;
			}
			else if (srcPath.length>0)
			{
				var path=srcPath[0].slice(1,-1);
				path=path.substring(path.indexOf('/src/'));
				str+=`Error in game script:<br><b>${path}</b><br>This may be caused by a recent update.`;
			}
			else
			{
				str+=`Error in game code.`;
				if (paths.length>0) str+=`<br><b>${paths[0].slice(1,-1)}</b>`;
			}
			
			if (str && l('failedToLoad'))
			{
				str+=`<div style="font-size:20px;margin-top:24px;"><a id="errorStartModless" class="highlightHover smallWhiteButton">Restart without mods?</a> <a id="errorQuit" class="highlightHover smallOrangeButton">Quit</a></div>`;
				l('failedToLoad').innerHTML=str;
				l('failedToLoad').style.animation='none';
				AddEvent(l('errorStartModless'),'click',()=>{Steam.reload({'modless':'1'})});
				AddEvent(l('errorQuit'),'click',Steam.quit);
			}
		}
	}
	
	window.addEventListener('error',onRuntimeError);
	window.addEventListener('unhandledrejection',onRuntimeError);
	
	callback();
}};