import { Router, Request, Response, NextFunction } from 'express';
import { InstructorRepository } from '../repositories/InstructorRepository';

const router = Router();

/**
 * GET /api/instructors
 * 모든 교관 조회
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instructorRepo = new InstructorRepository();
    const instructors = await instructorRepo.findAll();

    return res.status(200).json({
      success: true,
      instructors
    });
  } catch (error) {
    next(error);
  }
});

export default router;
