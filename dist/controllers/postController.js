"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.createPost = exports.getPostById = exports.getAllPosts = void 0;
const index_1 = require("../index");
const Post_1 = require("../entities/Post");
const User_1 = require("../entities/User");
const validate_1 = require("../utils/validate");
const postRepository = index_1.AppDataSource.getRepository(Post_1.Post);
const userRepository = index_1.AppDataSource.getRepository(User_1.User);
const getAllPosts = async (_req, res) => {
    try {
        const posts = await postRepository.find({ relations: ["user"], order: { createdAt: "DESC" } });
        res.json(posts);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getAllPosts = getAllPosts;
const getPostById = async (req, res) => {
    try {
        const post = await postRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ["user"],
        });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.json(post);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getPostById = getPostById;
const createPost = async (req, res) => {
    try {
        const user = await userRepository.findOneBy({ id: req.userId });
        if (!user)
            return res.status(401).json({ message: "User not found" });
        const { title, content } = req.body;
        const post = new Post_1.Post();
        post.title = title;
        post.content = content;
        post.user = user;
        await (0, validate_1.validateEntity)(post);
        await postRepository.save(post);
        res.status(201).json(post);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.createPost = createPost;
const updatePost = async (req, res) => {
    try {
        const post = await postRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ["user"],
        });
        if (!post)
            return res.status(404).json({ message: "Post not found" });
        if (post.user.id !== req.userId) {
            return res.status(403).json({ message: "Not authorized" });
        }
        const { title, content } = req.body;
        if (title)
            post.title = title;
        if (content)
            post.content = content;
        await (0, validate_1.validateEntity)(post);
        await postRepository.save(post);
        res.json(post);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
};
exports.updatePost = updatePost;
const deletePost = async (req, res) => {
    try {
        const post = await postRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ["user"],
        });
        if (!post)
            return res.status(404).json({ message: "Post not found" });
        if (post.user.id !== req.userId) {
            return res.status(403).json({ message: "Not authorized" });
        }
        await postRepository.remove(post);
        res.json({ message: "Post deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.deletePost = deletePost;
