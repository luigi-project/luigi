import { BrowserModule } from '@angular/platform-browser';
import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LuigiAngularSupportModule } from '@luigi-project/client-support-angular';
import { AppComponent } from './app.component';
import { PreloadComponent } from './preload/preload.component';
import { ProjectComponent } from './project/project.component';
import { UsersComponent } from './project/users/users.component';
import { AppRoutingModule } from './app-routing.module';
import { SettingsComponent } from './project/settings/settings.component';
import { DevelopersComponent } from './project/developers/developers.component';
import { DrawerComponent } from './project/drawer/drawer.component';
import { MiscellaneousComponent } from './project/miscellaneous/miscellaneous.component';
import { UsersoverviewComponent } from './project/users/usersoverview/usersoverview.component';
import { GroupsComponent } from './project/users/groups/groups.component';
import { GroupDetailsComponent } from './project/users/groups/group-details/group-details.component';
import { Miscellaneous2Component } from './project/miscellaneous2/miscellaneous2.component';
import { NavigationComponent } from './project/navigation/navigation.component';
import { ModalComponent } from './project/modal/modal.component';
import { CodeSnippetComponent } from './project/code-snippet/code-snippet.component';
import { ChildNode1Component } from './project/default-child/dps1/child-node-1.component';
import { ChildNode2Component } from './project/default-child/dps2/child-node-2.component';
import { OverviewComponent } from './overview/overview.component';
import { RestrictedComponent } from './restricted/restricted.component';
import { GroupSettingsComponent } from './project/users/groups/group-details/group-settings/group-settings.component';
import { DynamicComponent } from './project/dynamic/dynamic.component';
import { HideSideNavComponent } from './project/hide-side-nav/hide-side-nav.component';
import { AnonymousComponent } from './anonymous/anonymous.component';
import { OnNodeActivationComponent } from './onNodeActivation/onNodeActivation.component';
import { NavSyncComponent } from './nav-sync/nav-sync.component';
import { ViewGroupComponent } from './project/view-group/view-group.component';

@NgModule({
  declarations: [
    AppComponent,
    PreloadComponent,
    ProjectComponent,
    UsersComponent,
    SettingsComponent,
    DevelopersComponent,
    DrawerComponent,
    MiscellaneousComponent,
    UsersoverviewComponent,
    GroupsComponent,
    GroupDetailsComponent,
    Miscellaneous2Component,
    NavigationComponent,
    ModalComponent,
    CodeSnippetComponent,
    ChildNode1Component,
    ChildNode2Component,
    OverviewComponent,
    RestrictedComponent,
    GroupSettingsComponent,
    DynamicComponent,
    HideSideNavComponent,
    AnonymousComponent,
    OnNodeActivationComponent,
    NavSyncComponent,
    ViewGroupComponent
  ],
  imports: [BrowserModule, FormsModule, AppRoutingModule, LuigiAngularSupportModule],
  providers: [provideZoneChangeDetection()],
  bootstrap: [AppComponent]
})
export class AppModule {}
