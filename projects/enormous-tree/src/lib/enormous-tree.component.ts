import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  Output,
  EventEmitter
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { EnormousTreeChackBehaviorConfig, EnormousTreeChackBehaviorDefaultConfig } from './enormous-tree.model';
// tslint:disable-next-line: max-line-length
const workerJsStr = `var alias,groupMap=Object.create(null),treeitemMap=Object.create(null),treeitemSelectedMap=Object.create(null),groupSelectedMap=Object.create(null),behavior={checkGroupAndCheckAllChild:!0,uncheckGroupAndUncheckAllChild:!0,uncheckChildEffectParentGroup:!0};self.onmessage=function(e){var r=e.data;if(r){var t=JSON.parse(r);switch(t.action){case"$$enormousTreeInitTree":handleAllData(t)}}};var handleAllData=function(e){groupMap=Object.create(null),treeitemMap=Object.create(null),treeitemSelectedMap=Object.create(null),groupSelectedMap=Object.create(null);var r=(new Date).getTime();alias=e.alias,behavior=e.behavior,createTreeitemCheckedMap(e.selectedTreeitems),createGroupCheckedMap(e.selectedGroups),createGroupMap(e.groupList),createTreeitemMap(e.treeitemList),calculateChildNodeCount(),calculateCheckCount(),console.info("Enormous Tree:compute tree node dependency use "+((new Date).getTime()-r)+"ms"),self.postMessage(JSON.stringify({code:0,data:{groupMap:groupMap,treeitemMap:treeitemMap}}))};function createTreeitemCheckedMap(e){(e||[]).forEach(function(e){treeitemSelectedMap[e]=!0})}function calculateChildNodeCount(){var e=function(r){var t=0;return Array.isArray(r.childGroupIds)&&r.childGroupIds.length>0&&(t=r.childGroupIds.length,t=r.childGroupIds.reduce(function(r,t){return r+e(groupMap[t])},t)),t},r=function(e){var t=groupMap[e];t&&(t.totalChildCount++,null!=t.parentGroupId&&r(t.parentGroupId))};Object.keys(groupMap).forEach(function(r){var t=groupMap[r];groupMap[r].totalChildCount=e(t)}),Object.keys(treeitemMap).forEach(function(e){var t=treeitemMap[e];Array.isArray(t.groupIds)&&t.groupIds.length>0&&t.groupIds.forEach(function(e){r(e)})})}function createTreeitemMap(e){(e||[]).forEach(function(e){handleAlias(e,alias,"treeItemId"),handleAlias(e,alias,"treeItemName"),handleAlias(e,alias,"groupIds"),e.checked=!0===this.treeitemSelectedMap[e.treeItemId],treeitemMap[e.treeItemId]=e,Array.isArray(e.groupIds)&&e.groupIds.length>0&&e.groupIds.forEach(function(r){var t=groupMap[r];t&&(null==t.childTreeitemIds?t.childTreeitemIds=[e.treeItemId]:t.childTreeitemIds.push(e.treeItemId))})})}function createGroupCheckedMap(e){(e||[]).forEach(function(e){groupSelectedMap[e]=!0})}function calculateCheckCount(){Object.keys(treeitemMap).forEach(function(e){var r=treeitemMap[e];r.checked&&Array.isArray(r.groupIds)&&r.groupIds.length>0&&r.groupIds.forEach(function(e){updateParentCheckNum(e,1)})}),behavior.checkGroupAndCheckAllChild&&Object.keys(groupSelectedMap).forEach(function(e){checkGroup(e)})}function checkGroup(e){var r=groupMap[e];if(r){!1===r.checked&&(r.checked=!0,updateParentCheckNum(r.parentGroupId,1));var t=r.childGroupIds;Array.isArray(t)&&t.length>0&&t.forEach(function(e){checkGroup(e)});var a=r.childTreeitemIds;Array.isArray(a)&&a.length>0&&a.forEach(function(e){checkTreeItem(e)})}}function checkTreeItem(e){var r=treeitemMap[e];r&&0==r.checked&&(r.checked=!0,Array.isArray(r.groupIds)&&r.groupIds.length>0&&r.groupIds.forEach(function(e){updateParentCheckNum(e,1)}))}function updateParentCheckNum(e,r){var t=groupMap[e];if(t){var a=t.checked;t.childCheckedCount+=r,t.totalChildCount>0&&(t.childCheckedCount===t.totalChildCount?(t.checked=!0,t.indeterminate=!1,a!=t.checked?this.updateParentCheckNum(t.parentGroupId,r+1):this.updateParentCheckNum(t.parentGroupId,r)):(t.indeterminate=!0,this.updateParentCheckNum(t.parentGroupId,r)))}}function createGroupMap(e){var r=Object.create(null),t=[];(e||[]).forEach(function(e){handleAlias(e,alias,"groupId"),handleAlias(e,alias,"groupName"),handleAlias(e,alias,"childGroupIds"),e.parentGroupId=null,e.toggled=!1,e.totalChildCount=0,e.childCheckedCount=0,e.checked=!1,e.indeterminate=!1,e.isGroup=!0,groupMap[e.groupId]=e,Array.isArray(e.childGroupIds)&&e.childGroupIds.length>0?e.childGroupIds.forEach(function(a){t.push(a),r[a]=e.groupId}):delete e.childGroupIds}),t.forEach(function(e){var t=groupMap[e];t&&(t.parentGroupId=r[e])}),r=null,t=null}function handleAlias(e,r,t){return null==e[t]&&null!=r[t]&&(e[t]=e[r[t]]),e}`;

interface EnormousTreeData {
  isLoading: boolean;
  displayList: (GroupMapItem | TreeitemMapItem)[];
}

interface GroupMapItem {
  groupId: string;
  groupName: string;
  childGroupIds: string[];
  childTreeitemIds: string[];
  parentGroupId?: string;
  indeterminate: boolean;
  toggled: boolean;
  totalChildCount: number;
  childCheckedCount: number;
  checked: boolean;
  isGroup: boolean;
  level?: number;
  paddingLeft?: number;
}

interface TreeitemMapItem {
  treeItemId: string;
  treeItemName: string;
  checked: boolean;
  groupIds: string[];
  parentId?: string;
  level?: number;
  paddingLeft?: number;
}

interface EnormousTreeAlias {
  groupId?: string;
  groupName?: string;
  childGroupIds?: string;
  treeItemId?: string;
  treeItemName?: string;
  groupIds?: string;
}

@Component({
  selector: 'cc-enormous-tree',
  styleUrls: ['./enormous-tree.component.scss'],
  templateUrl: './enormous-tree.component.html'
})
export class EnormousTreeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('templatePortalContent') templatePortalContent: TemplateRef<any>;
  @Input() alias: EnormousTreeAlias = Object.create(null);
  @Input() enormousTreeItem: TemplateRef<any>;
  @Input() workerFileUrl: any;
  @Input() dataSource: Observable<any>;
  @Input() itemHeight: number;
  @Input() set behavior(b: EnormousTreeChackBehaviorConfig) {
    this.innerBehavior = Object.assign(EnormousTreeChackBehaviorDefaultConfig, b || {});
  }
  get behavior() {
    return this.innerBehavior;
  }
  @Output() selectChange = new EventEmitter<void>();
  @Output() treeLoad = new EventEmitter();
  data: EnormousTreeData = {
    isLoading: true,
    displayList: []
  };

  toggleItem = this.toggle.bind(this);
  checkItem = this.check.bind(this);
  private innerBehavior = EnormousTreeChackBehaviorDefaultConfig;
  private dataSourceSubscription: Subscription;
  // Group节点ID映射
  public groupMap: { [groupId: string]: GroupMapItem } = Object.create(null);
  // treeitem节点ID映射
  public treeitemMap: { [treeItemId: string]: TreeitemMapItem } = Object.create(null);
  private worker: Worker;
  // public nodeMap: { [id: string]: NodeMapItem } = Object.create(null);

  // private folderIDList: any = [];
  // private nodeIDList: any = [];
  private groupIndexMap: { [groupId: string]: number } = Object.create(null);
  // private selectedNodeMap: any = Object.create(null);
  private rootGroupId: any = null;
  private visitGroupID: any;

  constructor(

  ) {

  }

  getCheckGroup() {
    return Object.keys(this.groupMap).filter((groupId) => {
      return this.groupMap[groupId].checked;
    });
  }


  getIndeterminateGroup() {
    return Object.keys(this.groupMap).filter((groupId) => {
      const group = this.groupMap[groupId];
      return group.checked === false && group.indeterminate === true;
    });
  }

  getCheckedTreeItem() {
    return Object.keys(this.treeitemMap).filter((treeItemId) => {
      return this.treeitemMap[treeItemId].checked === true;
    });
  }


  ngOnInit() {

  }
  ngAfterViewInit() {
    try {
      const blob = new Blob([workerJsStr], { type: 'text/javascript' });
      this.worker = new Worker(window.URL.createObjectURL(blob));
    } catch (error) {
      this.worker = new Worker(this.workerFileUrl);
    }
    this.workerProcessingData();
  }

  private workerProcessingData() {
    this.dataSourceSubscription = this.dataSource.subscribe((result) => {
      this.rootGroupId = result.rootGroupId;
      this.visitGroupID = result.rootGroupId;
      this.groupIndexMap[result.rootGroupId] = 0;
      this.worker.postMessage(
        JSON.stringify(
          Object.assign(
            {
              action: '$$enormousTreeInitTree',
              alias: this.alias,
              behavior: this.behavior
              // relation: this.relation
            },
            result
          )
        )
      );
      this.worker.onmessage = (event: any) => {
        const workResult: any = JSON.parse(event.data);
        if (workResult.code === '0' || workResult.code === 0) {
          this.groupMap = workResult.data.groupMap;
          this.treeitemMap = workResult.data.treeitemMap;
          const rootGroup = this.groupMap[this.rootGroupId];
          rootGroup.level = 0;
          rootGroup.paddingLeft = 0;
          this.data.displayList = [].concat([rootGroup]);
          this.loadGroup();
          this.data.isLoading = false;
          this.treeLoad.next();
        }
      };
    });
  }

  // 加载某Group
  private loadGroup() {
    const currentGroup: GroupMapItem = this.data.displayList[this.groupIndexMap[this.visitGroupID]] as GroupMapItem;
    currentGroup.toggled = true;
    const t0 = new Date().getTime();
    this.loadGroupChild(currentGroup);
    console.log('Enormous Tree:load [Group] (' + currentGroup.groupName + ') use ' + (new Date().getTime() - t0) + ' ms');
  }


  // 加载某Group的子节点
  private loadGroupChild(currentGroup: GroupMapItem) {
    const groupId = currentGroup.groupId;
    const childLevel = currentGroup.level + 1;
    const childGroup = currentGroup.childGroupIds;
    const childTreeitem = currentGroup.childTreeitemIds;
    const list: (TreeitemMapItem | GroupMapItem)[] = [];
    if (childGroup) {
      childGroup.forEach((childGroupId) => {
        const childGroupItem = this.groupMap[childGroupId];
        childGroupItem.toggled = false;
        childGroupItem.level = childLevel;
        childGroupItem.paddingLeft = childLevel * 22 + 15;
        list.push(childGroupItem);
      });
    }
    if (childTreeitem) {
      childTreeitem.forEach((childTreeitemId) => {
        const treeitem = JSON.parse(JSON.stringify(this.treeitemMap[childTreeitemId])) as TreeitemMapItem;
        treeitem.parentId = groupId;
        treeitem.level = childLevel;
        treeitem.paddingLeft = childLevel * 22 + 15;
        list.push(treeitem);
      });
    }
    this.addChildToDisplayList(groupId, list);
  }

  // 在某节点往displayList里插入一组数据
  private addChildToDisplayList(preId, follow: any[]) {
    const index = this.groupIndexMap[preId];
    this.data.displayList.splice.apply(this.data.displayList, [index + 1, 0].concat(follow));
    this.data.displayList = [...this.data.displayList];
    this.updateGroupIndexAfterInsterPoint(index);
  }

  // 从某个插入点往displayList插入数据后 更新插入点后面的 group在displayList里的index索引
  private updateGroupIndexAfterInsterPoint(pointIndex) {
    let begin = pointIndex;
    const l = this.data.displayList.length;
    for (; begin < l; begin++) {
      const item = this.data.displayList[begin];
      if ((item as GroupMapItem).isGroup) {
        this.groupIndexMap[(item as GroupMapItem).groupId] = begin;
      }
    }
  }

  // group的展开折叠切换
  private toggle(clickedGroup: GroupMapItem) {
    if (clickedGroup.isGroup) {
      this.visitGroupID = clickedGroup.groupId;
      const group = this.groupMap[this.visitGroupID];
      if (group.toggled) {
        this.removeGroupChild();
        group.toggled = false;
        const parent = this.groupMap[group.parentGroupId];
        if (parent) {
          this.visitGroupID = parent.groupId;
        } else {
          this.visitGroupID = this.rootGroupId;
        }
      } else {
        this.loadGroup();
      }
    }
  }


  // 删除Group的子节点
  private removeGroupChild() {
    const currentGroup = this.groupMap[this.visitGroupID];
    const length = this.getGroupLastChild(currentGroup.groupId).index - this.groupIndexMap[currentGroup.groupId];
    this.data.displayList.splice(this.groupIndexMap[currentGroup.groupId] + 1, length);
    this.data.displayList = [...this.data.displayList];
    this.updateGroupIndexAfterInsterPoint(this.groupIndexMap[currentGroup.groupId]);
  }


  // 在displayList里寻找某个group的最后一个子节点的位置
  private getGroupLastChild(groupId) {
    const groupIndex = this.groupIndexMap[groupId];
    const group = this.data.displayList[groupIndex];
    const l = this.data.displayList.length;
    let index = 0;
    index = l;
    const nextLeve = group.level;
    for (let i = groupIndex + 1; i < l; i++) {
      const child = this.data.displayList[i];
      if (child.level <= nextLeve) {
        index = i;
        break;
      }
    }
    return {
      group,
      index: index - 1
    };
  }


  // 选中or不选中
  private check(item: GroupMapItem | TreeitemMapItem, checked) {
    const t0 = +new Date();
    if ((item as GroupMapItem).isGroup) { // 选了组
      this.checkGroup((item as GroupMapItem).groupId, checked);
      if (checked === false) {
        (item as GroupMapItem).indeterminate = false;
      }
    } else { // 选了Treeitem
      this.checkTreeItem((item as TreeitemMapItem).treeItemId, checked);
    }
    this.asyncTreeitemStstusInDisplayList();
    // tslint:disable-next-line: max-line-length
    console.log(`Enormous Tree:${checked ? 'check' : 'uncheck'}(${(item as GroupMapItem).groupName || (item as TreeitemMapItem).treeItemName}) use ${+new Date() - t0} ms`);
    this.selectChange.next();
  }



  // 选Group
  private checkGroup(groupId, checked, clearIndeterminate = false) {
    const group = this.groupMap[groupId];
    if (group) {
      if (checked !== group.checked) {
        group.checked = checked;
        group.indeterminate = false;
        this.updateParentGroupCheckNum(group.parentGroupId, checked ? 1 : -1);
      }
      if (this.behavior.checkGroupAndCheckAllChild && this.behavior.uncheckGroupAndUncheckAllChild) {
        this.handleCheckGroupChild(group, checked, !this.behavior.uncheckChildEffectParentGroup);
      } else if (!this.behavior.checkGroupAndCheckAllChild && this.behavior.uncheckGroupAndUncheckAllChild) {
        if (!checked) {
          this.handleCheckGroupChild(group, false);
        }
      } else if (this.behavior.checkGroupAndCheckAllChild && !this.behavior.uncheckGroupAndUncheckAllChild) {
        if (checked) {
          this.handleCheckGroupChild(group, true);
        }
      }
      // console.log(clearIndeterminate,group.groupId,this.behavior.uncheckGroupAndUncheckAllChild)
      if (clearIndeterminate) {
        group.indeterminate = false;
      }
    }
  }

  // 只选Group
  public checkGroupIgnoreChild(groupId, checked, clearIndeterminate = true) {
    const group = this.groupMap[groupId];
    if (group) {
      if (checked !== group.checked) {
        group.checked = checked;
        if (clearIndeterminate) {
          group.indeterminate = false;
        }
        this.updateParentGroupCheckNum(group.parentGroupId, checked ? 1 : -1);
      }
    }
  }


  // 处理Group子项选中
  private handleCheckGroupChild(group: GroupMapItem, checked, clearIndeterminate = false) {
    console.log(clearIndeterminate)
    const childGroupIds = group.childGroupIds;
    if (Array.isArray(childGroupIds) && childGroupIds.length > 0) {
      childGroupIds.forEach((childGroupId) => {
        this.checkGroup(childGroupId, checked, clearIndeterminate);
      });
    }
    const childTreeitemIds = group.childTreeitemIds;
    if (Array.isArray(childTreeitemIds) && childTreeitemIds.length > 0) {
      childTreeitemIds.forEach((childGroupId) => {
        this.checkTreeItem(childGroupId, checked);
      });
    }
  }


  // TreeItem的勾选
  private checkTreeItem(treeItemId, checked) {
    const treeItem = this.treeitemMap[treeItemId];
    if (treeItem) {
      if (treeItem.checked !== checked) {
        treeItem.checked = checked;
        treeItem.groupIds.forEach((group) => {
          this.updateParentGroupCheckNum(group, checked ? 1 : -1);
        });
      }
    }
  }


  // 更新上级Group的CheckNum
  private updateParentGroupCheckNum(groupId, num, treeitemTrigger = true) {
    const group = this.groupMap[groupId];
    if (group) {
      const preCheckStu = group.checked;
      group.childCheckedCount += num;
      if (!this.behavior.uncheckChildEffectParentGroup && num === -1) {
        if (group.totalChildCount > 0) {
          if (group.childCheckedCount === 0) {
            if (!this.behavior.uncheckGroupAndUncheckAllChild) {
              group.indeterminate = false;
            }
          } else if (group.childCheckedCount > 0) {
            group.indeterminate = true;
          }
        }
        this.updateParentGroupCheckNum(group.parentGroupId, -1, false);
      } else {
        if (group.totalChildCount > 0) {
          if (group.childCheckedCount === group.totalChildCount) {
            group.checked = true;
            group.indeterminate = false;
          } else if (group.childCheckedCount === 0) {
            group.checked = false;
            group.indeterminate = false;
          } else {
            group.checked = false;
            group.indeterminate = true;
          }
        }
        if (group.parentGroupId) {
          if (preCheckStu !== group.checked) {
            this.updateParentGroupCheckNum(group.parentGroupId, group.checked ? 1 + num : -1 + num, false);
          } else {
            this.updateParentGroupCheckNum(group.parentGroupId, num, false);
          }
        }
      }


    }
  }


  // 同步displayList中Treeitem的勾选状态
  private asyncTreeitemStstusInDisplayList() {
    this.data.displayList.forEach((_) => {
      if (!(_ as GroupMapItem).isGroup) {
        const treeItem = this.treeitemMap[(_ as TreeitemMapItem).treeItemId];
        if (treeItem) {
          _.checked = treeItem.checked;
        }
      }
    });
  }

  collapseAll(level: number = 0, interval?: number) {
    let maxLevel = Math.max.apply(null, Object.keys(this.groupMap).map(_ => this.groupMap[_].level));
    const loop = () => {
      Object.keys(this.groupMap).filter(_ => this.groupMap[_].level === maxLevel).forEach(_ => {
        const group = this.groupMap[_];
        if (group.toggled) {
          this.toggle(group);
        }
      });
      if (maxLevel > level && maxLevel > 0) {
        maxLevel--;
        if (interval != null) {
          setTimeout(() => loop(), interval);
        } else {
          loop();
        }
      }
    };
    loop();

    // if (!group) {
    //   Object.keys(this.groupMap).forEach((_) => {
    //     this.collapseAll(level, interval, this.groupMap[_]);
    //   });
    //   return;
    // }
    // if (level != null && group.level < level) {
    //   return;
    // }
    // if (group.toggled === true) {
    //   if (Array.isArray(group.childGroupIds) && group.childGroupIds.length > 0) {
    //     group.childGroupIds.forEach((_) => {
    //       const childGroup = this.groupMap[_];
    //       if (childGroup) {
    //         this.collapseAll(level, interval, childGroup);
    //       }
    //     });
    //   }else{
    //     console.log(group)
    //   }
    // }
  }

  // 展开全部
  expandAll(level?: number, interval?: number, group?: GroupMapItem) {
    if (!group) {
      group = this.groupMap[this.rootGroupId];
    }
    if (level != null && group.level > level) {
      return;
    }
    if (group.toggled === false) {
      this.toggle(group);
    }
    const childGroupIds = group.childGroupIds;
    if (Array.isArray(childGroupIds) && childGroupIds.length > 0) {
      childGroupIds.forEach((childGroupId) => {
        const childGroup = this.groupMap[childGroupId];
        if (childGroup) {
          if (interval != null) {
            setTimeout(() => {
              this.expandAll(level, interval, childGroup);
            }, interval);
          } else {
            this.expandAll(level, interval, childGroup);
          }
        }
      });
    }
  }





  ngOnDestroy() {
    this.dataSourceSubscription.unsubscribe();
  }

}
