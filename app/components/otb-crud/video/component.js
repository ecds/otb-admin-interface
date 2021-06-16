import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class OtbCrudVideoComponent extends Component {
  youtubeRegex = /(https?:\/\/)?(www.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/watch\?feature=player_embedded&v=|youtube\.com\/embed\/)([A-Za-z0-9_-]*)(&\S+)?(\?\S+)?/;
  vimeoRegex   = /https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
  vimeoEmbedRegex = /https?:\/\/?(player.vimeo.com\/video\/)(\d+)(?:$|\/|\?\S+)?/;
  instagramRegex = /(https?:\/\/)?(www.)?instagr(am\.com|\.am)\/p\/([A-Za-z0-9_-]*)/;
  soundcloudRegex = /<iframe.*?src="https:(.*?)"/;

  @service videoProviders;

  @tracked
  link = null;

  @tracked
  videoCode = null

  @tracked
  embed = null;

  @tracked
  error = null;

  @tracked
  videoProvider = null;

  @action
  getVideo() {
    if (this.vimeoRegex.test(this.link)) {
      this.videoCode = this.vimeoRegex.exec(this.link)[3];
      this.embed = `//player.vimeo.com/video/${this.videoCode}`;
      this.videoProvider = 'vimeo';
      this.error = false;
    } else if (this.vimeoEmbedRegex.test(this.link)) {
      this.videoCode = this.vimeoEmbedRegex.exec(this.link)[2];
      this.embed = `//player.vimeo.com/video/${this.videoCode}`;
      this.videoProvider = 'vimeo';
      this.error = false;
    } else if (this.youtubeRegex.test(this.link)) {
      this.videoCode = this.youtubeRegex.exec(this.link)[4];
      this.embed = `//www.youtube.com/embed/${this.videoCode}`;
      this.videoProvider = 'youtube';
      this.error = false;
    } else if (this.soundcloudRegex.test(this.link)) {
      this.videoCode = this.link;
      this.embed = this.soundcloudRegex.exec(this.link)[1];
      this.videoProvider = 'soundcloud';
      this.error = false;
    } /* else if (this.instagramRegex.test(this.link)) {
      this.videoCode = this.instagramRegex.exec(this.link)[4];
      this.embed = `http://instagram.com/reel/${this.videoCode}/embed`;
      this.video.error = false;
    } */ else {
      this.videoCode = null;
      this.embed = null;
      this.error = true;
    }
  }

  @action
  addVideo() {
    this.args.save.perform(
      {
        video: this.videoCode,
        videoProvider: this.videoProvider,
        embed: this.embed
      },
      this.args.model
    );
    this.videoCode = null;
    this.embed = null;
    this.videoProvider = null;
    this.error = null;
  }
}
