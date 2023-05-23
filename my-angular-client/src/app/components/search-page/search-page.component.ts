import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css'],
})
export class SearchPageComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
  searchRes: any;
  detailRes: any;
  clearDetail: any;
  clearToResTable: any;
  venueRes: any;
  spotifyRes: any;
  //spotifyRes is an array of array(2)，but corner case is it is []

  onSearch(res: any) {
    this.searchRes = res;
    console.log(this.searchRes);
  }
  onClear(res: any) {
    this.clearDetail = res;
    console.log(this.clearDetail);
  }
  onClearRes(res: any) {
    this.clearToResTable = res;
    console.log(this.clearToResTable);
  }
  onRetainTable(res: any) {
    this.clearToResTable = res;
    console.log(this.clearToResTable);
  }
  onClickTableRow(res: any) {
    this.detailRes = res;
    this.clearDetail = null;
    console.log('This is detailRes from result-table');
    console.log(this.detailRes);
  }
  onClickTableRowVenue(res: any) {
    this.venueRes = res;
    console.log('This is venueRes from result-table');
    console.log(this.venueRes);
  }
  onClickTableRowSpotify(res: any) {
    this.spotifyRes = res;
    console.log('This is spotifyRes from result-table');
    console.log(this.spotifyRes);
  }
}
