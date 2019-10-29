import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-channel-details',
  templateUrl: './channel-details.component.html',
  styleUrls: ['./channel-details.component.css']
})
export class ChannelDetailsComponent implements OnInit {
channel_description:boolean
  constructor() { }

  ngOnInit() {
    this.channel_description=true;
  }
  hideDescription(){
    this.channel_description=false;
  }

}