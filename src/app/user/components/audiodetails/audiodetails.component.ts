import { Component, OnInit } from '@angular/core';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {OthersService} from '../../services/others.service'
import {Validators, FormBuilder, FormGroup} from '@angular/forms';
import {PodcastService} from '../../services/podcast.service'
import { Location } from '@angular/common';
import {CommentService} from '../../services/comment.service'


@Component({
  selector: 'app-audiodetails',
  templateUrl: './audiodetails.component.html',
  styleUrls: ['./audiodetails.component.css']
})
export class AudiodetailsComponent implements OnInit {

  constructor(private modalService:NgbModal, private title: Title, private reuse:OthersService, private podservice:PodcastService,
    private meta: Meta, private route:Router, private router:ActivatedRoute, private fb:FormBuilder,
    private location:Location, private commentServices:CommentService) {
      this.router.params.subscribe(params => this.parameter = params.id2)
     }
closeResult:string
user:any
bookmark:boolean
reportForm:FormGroup
editForm:FormGroup
podcast:any
commentForm:FormGroup
replyForm:FormGroup
comments:any
p:number
comment_spinner:boolean=false;
parameter:string
query: any=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
edit_spinner:boolean=false
report_spinner:boolean=false

  ngOnInit() {
    this.podcast=this.router.snapshot.data['podcast']
      this.user=this.router.snapshot.data['user']
      this.comments=this.router.snapshot.data['comment']

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

      //forms
      this.replyForm=this.fb.group({
        comment:['', Validators.required],

      })
      this.commentForm=this.fb.group({
        comment:['', Validators.required]
      })

      this.reportForm=this.fb.group({
        report:['', Validators.required],
      })
      this.reportForm=this.fb.group({
        report:['', Validators.required]
      })
      this.editForm=this.fb.group({
        title:[this.podcast.message.title, Validators.required],
        desciption:[this.podcast.message.desciption, Validators.required]
      })
  }
  highlight() {
    if(!this.query) {
        return this.podcast.message.desciption;
    }
    return this.podcast.message.desciption.replace(new RegExp(this.query, "gi"), match => {
        return `<a href='${match}' target="_blank"><span class='text-primary'>` + match + '</span></a>';
    });
}

hightlight_comment(comment){
  if(!this.query) {
    return comment;
}
return comment.replace(new RegExp(this.query, "gi"), match => {
    return `<a href='${match}' target="_blank"><span class='text-primary'>` + match + '</span></a>';
});
}
  addComment(){
    var formValue=this.commentForm.value
    this.comment_spinner=true;
    this.commentServices.addPodcastComment(formValue, this.podcast.message.id).subscribe(val=>{
      this.comment_spinner=false;
      if(val['code']=="00"){
        this.reuse.successToast('Comment added', '')
        var push_data={
          comment:val['message'].comment,
          created_at:val['message'].created_at,
          id:val['message'].id,
          user:{
            name: val['message'].user.name,
            token:val['message'].user.token,
            id:val['message'].user.id
          },
          podcastreplies:[]
        }
        this.comments.message.push(push_data)
       
        this.commentForm=this.fb.group({
          comment:['', Validators.required]
        })
  
      }else{
        this.reuse.errorToast('Error adding comment', val['message'])
      }
    })
  }

  replyComment(a){
    var formValue=this.replyForm.value
    this.commentServices.addPodcastCommentReplies(formValue, a.id).subscribe(val=>{
      if(val['code']=="00"){
        var push_data={
          comment:val['message'].comment,
          created_at:val['message'].created_at,
          id:val['message'].id,
          user:{
            name:val['message'].user.name,
            token:val['message'].user.token,
            id:val['message'].user.id
          }
        }
        a.podcastreplies.push(push_data)
        this.reuse.successToast('replied', 'reply added successfully')
        this.replyForm=this.fb.group({
          comment:['', Validators.required],
  
        })
      }else{
          this.reuse.errorToast('error', val['message'])
      }
    })
  }

  deleteReply(a, b){
    this.commentServices.DeletePodcastReply(b.id).subscribe(val=>{
      if(val['code']=="00"){
        a.podcastreplies.splice(a.podcastreplies.indexOf(b), 1)
      }else{
        this.reuse.errorToast("Error", val['message'])
      }
    })
  }


  deleteComment(a){
    this.commentServices.deletePodcastComment(a.id).subscribe(val=>{
      if(val['code']=="00"){
        var index=this.comments.message.indexOf(a)
        this.comments.message.splice(index, 1);
        this.reuse.successToast('Comment removed', '')
      }else{
        this.reuse.errorToast('Error removing comment', val['message'])
      }
    })
  }


  paginateComment(e){
    this.commentServices.getPodcastComment(this.parameter, e, 5).subscribe(val=>{
      this.comments.message=val['message']
    })
    this.p=parseInt(e)
  }
  editPodcast(){
    var formValue=this.editForm.value
    this.edit_spinner=true
    this.podservice.editPodcast(formValue, this.podcast.message.id).subscribe(val=>{
      this.edit_spinner=false;
      if(val['code']=="00"){
        this.reuse.successToast('Successful', val['message'])
        this.podcast.message.title=formValue.title
        this.podcast.message.desciption=formValue.desciption
        this.modalService.dismissAll()
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
    this.report_spinner=true
    this.podservice.reportPodcast(formValue, this.podcast.message.id).subscribe(val=>{
      this.report_spinner=false
      if(val['code']=="00"){
        this.reuse.successToast('Sent', val['message'])
        this.modalService.dismissAll()
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
