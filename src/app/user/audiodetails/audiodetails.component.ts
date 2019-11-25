import { Component, OnInit } from '@angular/core';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {OthersService} from '../services/others.service'
import {Validators, FormBuilder, FormGroup} from '@angular/forms';
import {PodcastService} from '../services/podcast.service'
import { Location } from '@angular/common';


@Component({
  selector: 'app-audiodetails',
  templateUrl: './audiodetails.component.html',
  styleUrls: ['./audiodetails.component.css']
})
export class AudiodetailsComponent implements OnInit {

  constructor(private modalService:NgbModal, private title: Title, private reuse:OthersService, private podservice:PodcastService,
    private meta: Meta, private route:Router, private router:ActivatedRoute, private fb:FormBuilder,
    private location:Location) { }
closeResult:string
user:any
bookmark:boolean
reportForm:FormGroup
editForm:FormGroup
podcast:any
  ngOnInit() {
    this.podcast=this.router.snapshot.data['podcast']
      this.user=this.router.snapshot.data['user']
      this.title.setTitle(this.podcast.message.title);
      this.meta.updateTag({ name: this.podcast.message.title, content: this.podcast.message.description });
      if(this.podcast.code=="01"){
        this.location.back()
        this.reuse.infoToast('Suspended', this.podcast.message)
      }
      if(this.user.code!="00"){
        this.reuse.logoutAndRedirect();
        this.reuse.infoToast('Try to login again', "Token expired")
      }
      this.bookmark=this.router.snapshot.data['bookmark'].message
      this.reportForm=this.fb.group({
        report:['', Validators.required]
      })
      this.editForm=this.fb.group({
        title:[this.podcast.message.title, Validators.required],
        desciption:[this.podcast.message.desciption, Validators.required]
      })
  }

  editPodcast(){
    var formValue=this.editForm.value
    this.podservice.editPodcast(formValue, this.podcast.message.id).subscribe(val=>{
      if(val['code']=="00"){
        this.reuse.successToast('Successful', val['message'])
        this.podcast.message.title=formValue.title
        this.podcast.message.desciption=formValue.desciption
      }else{
        this.reuse.errorToast('Error', val['message'])
      }
    })
  }

  deletepodcast(){
    this.podservice.deletePodcast(this.podcast.message.id).subscribe(val=>{
      this.reuse.successToast('Success', val['message'])
      this.route.navigate(['/user/addcontent'])

    })
  }

  bookmark_func(){
    this.podservice.bookmarkPodcast(this.podcast.message.id).subscribe(val=>{
      if(val['code']=="00"){
        this.bookmark=val['bookmark']
      }else{
        this.reuse.errorToast('Error', val['message'])
      }
    })
  }

  report(){
    var formValue=this.reportForm.value
    this.podservice.reportPodcast(formValue, this.podcast.message.id).subscribe(val=>{
      if(val['code']=="00"){
        this.reuse.successToast('Sent', val['message'])
      }else{
        this.reuse.errorToast('Error', val['message'])
      }
    })
  }

  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

}
