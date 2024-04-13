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
      blog.images = [images];
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
async updatePost({
  id,
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
  console.log(id, "in rpeo")
  try {
    // Validate user
    const validUser = await this.getUser(author);
    if (!validUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Find the blog to update
   const blog = await this.blogRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    // Check if the authenticated user is the post author or an admin
    // if (blog.author.id !== validUser.id) {
    //   throw new HttpException(
    //     'You are not authorized to update this blog',
    //     HttpStatus.UNAUTHORIZED,
    //   );
    // }

    // Update blog data
    // Update properties
blog.title = title ?? blog.title;
blog.slug = slug ?? slugify(title ?? blog.title); // Revise slug logic
blog.metaTitle = metaTitle ?? blog.metaTitle;
blog.metaDescription = metaDescription ?? blog.metaDescription;
blog.contents = contents ?? blog.contents;
blog.images = [images ?? blog.images];
blog.coverImage = coverImage ?? blog.coverImage;
blog.schemaMarkup = schemaMarkup ??  blog.schemaMarkup;
blog.updatedAt = new Date();
blog.updatedBy = validUser.id;

// Update tags if provided
if (tags && tags.length > 0) {
  const inputTags = new Set(tags);
  const filteredTags = [...inputTags];

  // Add new tags if they don't exist
  for (const tag of tags) {
    if (!blog.tags.includes(tag)) {
      blog.tags.push(tag);
    }
  }

  // Remove tags that are not in the input set
  blog.tags = blog.tags.filter(tag => inputTags.has(tag));
}

// Save updated blog
await this.blogRepository.save(blog);


    return {
      status: HttpStatus.CREATED,
      message: 'Blog updated successfully',
    };
  } catch (error) {
    this.defaultLogger.error(error);
    if (error instanceof HttpException) {
      return error;
    }
    return new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}



  async fetchAllBlog() {
    return this.blogRepository.find({ relations: ['author'] });
  }

  async fetchBlogBySlug(slug) {
    console.log(slug, 'comming');
    const blog = this.blogRepository.findOne({
      where: { slug },
      relations: ['author'],
    });
    return blog;
  }

  async fetchBlogById({ id }): Promise<Blog | undefined> {
    const blogs = this.blogRepository.findOne({
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
