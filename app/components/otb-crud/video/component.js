import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class OtbCrudVideoComponent extends Component {
  youtubeRegex = /(https?:\/\/)?(www.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/watch\?feature=player_embedded&v=|youtube\.com\/embed\/)([A-Za-z0-9_-]*)(&\S+)?(\?\S+)?/;
  vimeoRegex   = /https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
  vimeoEmbedRegex = /https?:\/\/?(player.vimeo.com\/video\/)(\d+)(?:$|\/|\?\S+)?/;
  instagramRegex = /(https?:\/\/)?(www.)?instagr(am\.com|\.am)\/p\/([A-Za-z0-9_-]*)/;

  embedCode = '<iframe width="560" height="315" src="https://www.youtube.com/embed/lVehcuJXe6I" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
  embedCode = '<iframe src="https://player.vimeo.com/video/259134302" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe><p><a href="https://vimeo.com/259134302">MIGOS  ||  S T I R   F R Y</a> from <a href="https://vimeo.com/singjlee">Sing J. Lee</a> on <a href="https://vimeo.com">Vimeo</a>.</p>';
  link = 'https://vimeo.com/259134302'

  @service videoProviders;

  @tracked
  link = null;

  @tracked
  videoCode = null

  @tracked
  embed = null;

  @tracked
  error = null;

  @action
  getVideo() {
    if (this.vimeoRegex.test(this.link)) {
      this.videoCode = this.vimeoRegex.exec(this.link)[3];
      this.embed = `//player.vimeo.com/video/${this.videoCode}`;
      this.error = false;
    } else if (this.vimeoEmbedRegex.test(this.link)) {
      this.videoCode = this.vimeoEmbedRegex.exec(this.link)[2];
      this.embed = `//player.vimeo.com/video/${this.videoCode}`;
      this.error = false;
    } else if (this.youtubeRegex.test(this.link)) {
      this.videoCode = this.youtubeRegex.exec(this.link)[4];
      this.embed = `//www.youtube.com/embed/${this.videoCode}`;
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
    this.args.save.perform(this.videoCode, this.args.model);
    this.videoCode = null;
    this.embed = null;
    this.error = null;
  }
}
