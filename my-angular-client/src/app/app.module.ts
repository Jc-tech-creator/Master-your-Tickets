import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GoogleMapsModule } from '@angular/google-maps';

import { AppComponent } from './app.component';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { SearchFormComponent } from './components/search-form/search-form.component';
import { ResultTableComponent } from './components/result-table/result-table.component';
import { SearchPageComponent } from './components/search-page/search-page.component';
import { FavPageComponent } from './components/fav-page/fav-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EventDetailComponent } from './event-detail/event-detail.component';

const appRoutes: Routes = [
  { path: '', redirectTo: '/search', pathMatch: 'full' },
  { path: 'search', component: SearchPageComponent },
  { path: 'favorites', component: FavPageComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    SearchFormComponent,
    ResultTableComponent,
    SearchPageComponent,
    FavPageComponent,
    EventDetailComponent,
  ],
  imports: [
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    MatTabsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes, { enableTracing: true }),
    BrowserAnimationsModule,
    GoogleMapsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
