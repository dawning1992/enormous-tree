var folderMap={},nodeMap={},selectedNodesMap={},selectedFoldersMap={},RootFolder;self.onmessage=function(event){var e=event.data;if(e){var data=JSON.parse(e);switch(data.action){case'$$initTree':handleAllData(data);break}}};var handleAllData=function(data){var t0=new Date().getTime();try{initNodeCheckMap(data.selectedNodes);initFolder(data.folderResult);RootFolder=folderMap[data.rootFolderId];RootFolder.level=0;RootFolder.paddingLeft=15;addFolderPid(data.folderResult);initFoldersCheckedMap(data.selectedFolders);initNode(data.nodeResult);calculateFolderTotal(data.folderResult);calculateNodeCheck(data.nodeResult);calculateEmptyFolderCheck();console.info('Enormous Tree:compute node dependency use '+(new Date().getTime()-t0)+'ms');self.postMessage(JSON.stringify({code:0,data:{folderMap:folderMap,nodeMap:nodeMap}}))}catch(e){self.postMessage(JSON.stringify({code:-1}))}};var calculateEmptyFolderCheck=function(){Object.keys(selectedFoldersMap).forEach(function(folderId){checkEmptyFolder(folderId)})};var checkEmptyFolder=function(folderId){var folder=folderMap[folderId];if(folder.total===0){folder.checked=true;checkEmptyFolderParent(folder)}};var checkEmptyFolderParent=function(folder){if(folder.pid){var parent=folderMap[folder.pid];parent.childCheck++;if(parent.childCheck===parent.total){parent.checked=true}checkEmptyFolderParent(parent)}};var calculateNodeCheck=function(allNodes){allNodes.forEach(function(node){var node=nodeMap[node.id];if(node&&node.checked){node.folderIds.forEach(function(folderId){loopAddCheckFolder(folderId,true)})}})};var calculateFolderTotal=function(allFolder){var loopFolder=function(folder,n){var pFolder=folderMap[folder.pid];if(pFolder){pFolder.totalNode+=n;loopFolder(pFolder,n)}};allFolder.forEach(function(__folder){var folder=folderMap[__folder.id];folder.total=folder.child.length+folder.nodes.length;folder.totalNode+=folder.nodes.length;loopFolder(folder,folder.nodes.length)})};var initNodeCheckMap=function(node_ids){node_ids.forEach(function(node_id){selectedNodesMap[node_id]=true})};var initFoldersCheckedMap=function(folder_ids){(folder_ids||[]).forEach(function(folder_id){selectedFoldersMap[folder_id]=true;var folder=folderMap[folder_id];if(folder&&Array.isArray(folder.child)){initFoldersCheckedMap(folder.child)}})};var addFolderPid=function(allFolder){allFolder.forEach(function(folder){folder.child_ids.forEach(function(childFolderId){var childFolder=folderMap[childFolderId];if(childFolder){childFolder.pid=folder.id}})})};var loopAddCheckFolder=function(folderId,isCheckAll){var folder=folderMap[folderId];if(folder){folder.have++;if(isCheckAll){folder.childCheck++;if(folder.childCheck===folder.total){folder.checked=true;loopAddCheckFolder(folder.pid,true)}else{loopAddCheckFolder(folder.pid,false)}}else{loopAddCheckFolder(folder.pid,false)}}};var initNode=function(allNode){allNode.forEach(function(node){var _node={id:node.id,name:node.name,checked:selectedNodesMap[node.id],folderIds:node.f_ids,isFolder:false,paddingLeft:0};nodeMap[node.id]=_node;if(node.f_ids.length==0){_node.folderIds=[RootFolder.id];RootFolder.nodes.push(node.id)}else{node.f_ids.forEach(function(folderid){if(selectedFoldersMap[folderid]){_node.checked=true}var folder=folderMap[folderid];if(folder){folder.nodes.push(node.id)}})}})};var initFolder=function(allFolders){allFolders.forEach(function(folder){folderMap[folder.id]={id:folder.id,name:folder.name,total:0,totalNode:0,checked:false,childCheck:0,have:0,isFolder:true,nodes:[],child:folder.child_ids,open:false,paddingLeft:0}})};