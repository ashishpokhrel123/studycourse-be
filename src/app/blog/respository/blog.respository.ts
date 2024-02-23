import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger as DefaultLogger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from 'src/common/entities/blog.entity';
import { ScUser } from 'src/common/entities/user.entity';
import slugify from 'slugify';

@Injectable()
export class BlogRepository {
  private readonly defaultLogger = new DefaultLogger(BlogRepository.name);
  constructor(
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(ScUser)
    private readonly userRepository: Repository<ScUser>,
  ) {}

  async createBlog({
    title,
    contents,
    metaTitle,
    metaDescription,
    author,
    tags,
    coverImage,
    images,
    slug,
    schemaMarkup,
  }): Promise<{ status: number; message: string } | HttpException> {
    try {
      if (!title) {
        throw new HttpException('Title is required', HttpStatus.BAD_REQUEST);
      }
      const isBlogTitleExists = await this.blogRepository.findOne({
        where: { title },
      });
      if (isBlogTitleExists) {
        throw new HttpException(
          'Blog title already exist',
          HttpStatus.CONFLICT,
        );
      }

      const isBlogSlugExists = await this.blogRepository.findOne({
        where: { slug },
      });
      if (isBlogSlugExists) {
        throw new HttpException('Blog slug already exist', HttpStatus.CONFLICT);
      }

      // Retrieve the valid user
      const validUser = await this.getUser(author);

      // Create a new blog instance
      const blog = new Blog();
      blog.title = title;
      blog.slug = slugify(title);
      blog.metaTitle = metaTitle;
      blog.metaDescription = metaDescription;
      blog.contents = contents;
      blog.author = validUser;
      blog.tags = tags;
      blog.coverImage = coverImage;
      blog.images = images;
      blog.schemaMarkup = schemaMarkup;
      blog.createdAt = new Date();
      blog.createdBy = validUser.id;

      const savedPost = await this.blogRepository.save(blog);

      return {
        status: HttpStatus.CREATED,
        message: 'Blog created successfully',
      };
    } catch (error) {
      this.defaultLogger.log(error);
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async updatePost(
    updateBlogDto,
  ): Promise<{ status: number; message: string } | HttpException> {
    try {
      const {
        id,
        title,
        metaTitle,
        metaDescription,
        contents,
        author,
        tags,
        coverImage,
        images,
        slug,
        schemaMarkup,
      } = updateBlogDto;
      //parsed User
      const validUser = await this.getUser(author);

      // Find the blog to update

      const blog = await this.blogRepository.findOne({
        where: { id },
        relations: ['categories', 'author'],
      });

      if (!blog) {
        throw new HttpException('Blog not found', HttpStatus.NOT_FOUND);
      }

      // Check if the authenticated user is the post author or an admin

      if (!validUser || blog.author.id !== validUser.id) {
        throw new HttpException(
          'You are not authorized to update this blog',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Update blog data
      blog.title = title ?? blog.title;
      if (slug === '') {
        blog.slug = slugify(title);
      } else {
        blog.slug = slugify(slug);
      }
      (blog.metaTitle = metaTitle), (blog.metaDescription = metaDescription);
      blog.contents = contents ?? blog.contents;
      blog.images = images ?? blog.images;
      blog.coverImage = coverImage ?? blog.coverImage;
      blog.schemaMarkup = schemaMarkup;
      blog.updatedAt = new Date();
      blog.updatedBy = validUser.id;

      const updatedBlog = await this.blogRepository.save(blog);

      //update tags

      if (tags && tags != null && tags?.length < 0) {
        const inputTags = new Set(tags);
        const filteredTags = blog.tags.filter((tag) => inputTags.has(tag));

        for (const tag of tags) {
          if (!filteredTags.includes(tag)) {
            filteredTags.push(tag);
          }
        }
        updatedBlog.tags = filteredTags;
      }

      //update blog
      await this.blogRepository.save(updatedBlog);

      return {
        status: HttpStatus.OK,
        message: 'Blog updated successfully',
      };
    } catch (error) {
      this.defaultLogger.log(error);
      return new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async fetchAllBlog() {
    return this.blogRepository.find({ relations: ['author'] });
  }

  async fetchBlogBySlug({ slug }) {
    const blog =  this.blogRepository.findOne({
      where: { slug },
      relations: ['author'],
    });

    console.log(blog)
  }

  async fetchBlogById({ id }):Promise<Blog | undefined> {
    const blogs =  this.blogRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    return blogs;
  }

  async getUser(id: string) {
    return await this.userRepository.findOne({ where: { id } });
  }

  async getPost(id: string) {
    return await this.blogRepository.findOne({ where: { id } });
  }
}
