import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-fav-page',
  templateUrl: './fav-page.component.html',
  styleUrls: ['./fav-page.component.css'],
})
export class FavPageComponent implements OnInit {
  favData: { storeKey: string; storeKalue: any }[] = [];
  ngOnInit() {
    // localStorage.clear();
    this.loadfavData();
    console.log('This is favData');
    console.log(this.favData);
  }
  constructor(private cdr: ChangeDetectorRef) {}
  //above is constructot, the ChangeDetectorRef methods is reference from youtube tutorial
  loadfavData() {
    // the logic is reference from stackOverFlow
    for (const [k, v] of Object.entries(localStorage)) {
      this.favData.push({
        storeKey: k,
        storeKalue: JSON.parse(v),
      });
    }
    // the sorting logic is reference from stackOverFlow
    this.favData.sort(
      (a, b) => a.storeKalue.Timestamp - b.storeKalue.Timestamp
    );
  }
  onDelete(storekey: any, k: number) {
    console.log('below is the k and storeKey');
    console.log(k);
    console.log(storekey);
    alert('Removed from Favorites!');
    localStorage.removeItem(storekey);
    this.favData.splice(k, 1);
    this.cdr.detectChanges();
  }
}
