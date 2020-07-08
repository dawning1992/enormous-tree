var groupMap = Object.create(null),
    treeitemMap = Object.create(null),
    treeitemSelectedMap = Object.create(null),
    groupSelectedMap = Object.create(null),
    alias,
    behavior = {
        checkGroupAndCheckAllChild: true,
        uncheckGroupAndUncheckAllChild: true,
        uncheckChildEffectParentGroup: true
    };
self.onmessage = function (event) {
    var e = event.data;
    if (e) {
        var data = JSON.parse(e);
        switch (data.action) {
            case '$$enormousTreeInitTree':
                handleAllData(data);
                break;
        }
    }

};


var handleAllData = function (data) {
    groupMap = Object.create(null);
    treeitemMap = Object.create(null);
    treeitemSelectedMap = Object.create(null);
    groupSelectedMap = Object.create(null);
    var t0 = new Date().getTime();
    alias = data.alias;
    behavior = data.behavior;
    createTreeitemCheckedMap(data.selectedTreeitems);
    createGroupCheckedMap(data.selectedGroups);
    createGroupMap(data.groupList);
    createTreeitemMap(data.treeitemList);
    calculateChildNodeCount();
    calculateCheckCount();
    console.info('Enormous Tree:compute tree node dependency use ' + (new Date().getTime() - t0) + 'ms');
    self.postMessage(JSON.stringify({
        code: 0,
        data: {
            groupMap: groupMap,
            treeitemMap: treeitemMap
        }
    }));
}


function createTreeitemCheckedMap(arr) {
    (arr || []).forEach(function (id) {
        treeitemSelectedMap[id] = true;
    });
}


// 计算Group子节点个数
function calculateChildNodeCount() {
    var countGroupChild = function (group) {
        var childCount = 0;
        if (Array.isArray(group.childGroupIds) && group.childGroupIds.length > 0) {
            childCount = group.childGroupIds.length;
            childCount = group.childGroupIds.reduce(function (pre, x) {
                return pre + countGroupChild(groupMap[x]);
            }, childCount);
        }
        return childCount;
    }
    var groupAddItem = function (groupId) {
        var group = groupMap[groupId];
        if (group) {
            group.totalChildCount++;
            if (group.parentGroupId != null) {
                groupAddItem(group.parentGroupId);
            }
        }
    }
    Object.keys(groupMap).forEach(function (groupId) {
        var group = groupMap[groupId];
        groupMap[groupId].totalChildCount = countGroupChild(group);
    });
    Object.keys(treeitemMap).forEach(function (treeitemId) {
        var treeitem = treeitemMap[treeitemId];
        if (Array.isArray(treeitem.groupIds) && treeitem.groupIds.length > 0) {
            treeitem.groupIds.forEach(function (groupId) {
                groupAddItem(groupId);
            });
        }
    });
}


// 创建treeitem映射
function createTreeitemMap(treeitemList) {
    (treeitemList || []).forEach(function (treeitem) {
        handleAlias(treeitem, alias, 'treeItemId');
        handleAlias(treeitem, alias, 'treeItemName');
        handleAlias(treeitem, alias, 'groupIds');
        treeitem.checked = this.treeitemSelectedMap[treeitem.treeItemId] === true;
        treeitemMap[treeitem.treeItemId] = treeitem;
        if (Array.isArray(treeitem.groupIds) && treeitem.groupIds.length > 0) {
            treeitem.groupIds.forEach(function (groupId) {
                var group = groupMap[groupId];
                if (group) {
                    if (group.childTreeitemIds == null) {
                        group.childTreeitemIds = [treeitem.treeItemId];
                    } else {
                        group.childTreeitemIds.push(treeitem.treeItemId);
                    }
                }
            })
        }
    });
}


function createGroupCheckedMap(groups) {
    (groups || []).forEach(function (_) {
        groupSelectedMap[_] = true;
    });
}

function calculateCheckCount() {
    Object.keys(treeitemMap).forEach(function (treeItemId) {
        var treeitem = treeitemMap[treeItemId];
        if (treeitem.checked) {
            if (Array.isArray(treeitem.groupIds) && treeitem.groupIds.length > 0) {
                treeitem.groupIds.forEach(function (parentGroupId) {
                    updateParentCheckNum(parentGroupId, 1);
                })
            }
        }
    });
    Object.keys(groupSelectedMap).forEach(function (_) {
        checkGroup(_);
    });

}

function checkGroup(groupId) {
    var group = groupMap[groupId];
    if (group) {
        if (group.checked === false) {
            group.checked = true;
            updateParentCheckNum(group.parentGroupId, 1);
        }
        if (behavior.checkGroupAndCheckAllChild && behavior.uncheckChildEffectParentGroup) {
            var childGroupIds = group.childGroupIds;
            if (Array.isArray(childGroupIds) && childGroupIds.length > 0) {
                childGroupIds.forEach(function (_) {
                    checkGroup(_);
                });
            }
            var childTreeitemIds = group.childTreeitemIds;
            if (Array.isArray(childTreeitemIds) && childTreeitemIds.length > 0) {
                childTreeitemIds.forEach(function (_) {
                    checkTreeItem(_);
                });
            }
        }
    }
}


function checkTreeItem(treeitemId) {
    var treeItem = treeitemMap[treeitemId];
    if (treeItem) {
        if (treeItem.checked == false) {
            treeItem.checked = true;
            if (Array.isArray(treeItem.groupIds) && treeItem.groupIds.length > 0) {
                treeItem.groupIds.forEach(function (parentGroupId) {
                    updateParentCheckNum(parentGroupId, 1);
                })
            }
        }
    }
}

function updateParentCheckNum(parentGroupId, num) {
    var group = groupMap[parentGroupId];
    if (group) {
        var preCheckStu = group.checked;
        group.childCheckedCount += num;
        if (group.totalChildCount > 0) {
            if (group.childCheckedCount === group.totalChildCount) {
                group.checked = true;
                group.indeterminate = false;
                if (preCheckStu != group.checked) {

                    this.updateParentCheckNum(group.parentGroupId, num + 1)
                } else {
                    this.updateParentCheckNum(group.parentGroupId, num)
                }

            } else {
                group.indeterminate = true;
                this.updateParentCheckNum(group.parentGroupId, num)
            }
        }
    }
}

// 创建Group映射
function createGroupMap(groupList) {
    var parentMap = Object.create(null);
    var childGroupIdCol = [];
    (groupList || []).forEach(function (groupItem) {
        handleAlias(groupItem, alias, 'groupId');
        handleAlias(groupItem, alias, 'groupName');
        handleAlias(groupItem, alias, 'childGroupIds');
        groupItem.parentGroupId = null;
        groupItem.toggled = false;
        groupItem.totalChildCount = 0;
        groupItem.childCheckedCount = 0;
        groupItem.checked = false;
        groupItem.indeterminate = false;
        groupItem.isGroup = true;
        groupMap[groupItem.groupId] = groupItem;
        if (Array.isArray(groupItem.childGroupIds) && groupItem.childGroupIds.length > 0) {
            groupItem.childGroupIds.forEach(function (childGroupId) {
                childGroupIdCol.push(childGroupId)
                parentMap[childGroupId] = groupItem.groupId;
            });
        } else {
            delete groupItem.childGroupIds;
        }
    });
    (childGroupIdCol).forEach(function (childGroupId) {
        var childGroup = groupMap[childGroupId];
        if (childGroup) {
            childGroup.parentGroupId = parentMap[childGroupId];
        }
    });
    parentMap = null;
    childGroupIdCol = null;
}


// 处理别名
function handleAlias(item, alias, aliasName) {
    if (item[aliasName] == null && alias[aliasName] != null) {
        item[aliasName] = item[alias[aliasName]];
    }
    return item;
}