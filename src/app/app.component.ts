import { Component, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnormousTreeChackBehaviorConfig, EnormousTreeComponent } from 'projects/enormous-tree/src/public-api';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('enormousTreeItem') enormousTreeItem: TemplateRef<any>;
  @ViewChild(EnormousTreeComponent) enormousTree: EnormousTreeComponent;
  dataSource: Observable<any>;
  behavior: EnormousTreeChackBehaviorConfig = {
    checkGroupAndCheckAllChild: true,
    uncheckGroupAndUncheckAllChild: true,
    uncheckChildEffectParentGroup: false,
  };
  constructor(
    private http: HttpClient
  ) {
    this.dataSource = zip(
      this.http.get('/assets/data/group.json'),
      this.http.get('/assets/data/treeitem.json')
    ).pipe(
      map((result) => {
        return {
          groupList: result[0],
          treeitemList: result[1],
          selectedGroups: [],
          selectedTreeitems: [],
          rootGroupId: 'root'
        };
      })
    );
  }
  loop() {
    // this.enormousTree.expandAll(null, 200);
    // setTimeout(() => {
    //   this.enormousTree.collapseAll(1, 200);
    // }, 2000);
  }
  onTreeLoad() {
    this.enormousTree.expandAll();
    // console.log(this.enormousTree.getCheckGroup());
    // console.log(this.enormousTree.getIndeterminateGroup());
    // console.log(this.enormousTree.getCheckedTreeItem());
    // this.loop();
    // setInterval(() => {
    //   this.loop();
    // }, 5000);
  }
  ngAfterViewInit() {

  }
  log(e) {
    console.log(e);
  }
}
