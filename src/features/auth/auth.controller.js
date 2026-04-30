const { z } = require("zod");
const { signInParent, loginParent, kidLogin } = require("./auth.service");
const { parseDdMmYyyyToIsoDate, isoDateToDdMmYyyy } = require("../../utils/date");

const signInSchema = z.object({
  username: z.string().min(3).max(50),
  childType: z.enum(["boy", "girl"]),
  parentName: z.string().min(2).max(120),
  mobileNumber: z.string().min(8).max(20),
  dateOfBirth: z.string(),
  password: z.string().min(6).max(100)
});

const parentLoginSchema = z.object({
  identifier: z.string().min(3).max(50),
  password: z.string().min(6).max(100)
});

const kidLoginSchema = z.object({
  kidName: z.string().min(1).max(120),
  dateOfBirth: z.string()
});

async function signIn(req, res, next) {
  try {
    const parsed = signInSchema.parse(req.body);
    const isoDob = parseDdMmYyyyToIsoDate(parsed.dateOfBirth);

    if (!isoDob) {
      return res.status(400).json({
        success: false,
        message: "dateOfBirth must be in dd/mm/yyyy format"
      });
    }

    const parent = await signInParent({
      username: parsed.username,
      parentName: parsed.parentName,
      mobileNumber: parsed.mobileNumber,
      password: parsed.password,
      childType: parsed.childType,
      signupKidDob: isoDob
    });

    return res.status(201).json({
      success: true,
      message: "Parent sign in successful",
      data: {
        id: parent.id,
        username: parent.username,
        parentName: parent.parent_name,
        mobileNumber: parent.mobile_number,
        childType: parsed.childType,
        dateOfBirth: parsed.dateOfBirth,
        createdAt: parent.created_at
      }
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.issues.map((issue) => issue.message).join("; ")
      });
    }
    return next(error);
  }
}

async function parentLogin(req, res, next) {
  try {
    const parsed = parentLoginSchema.parse(req.body);
    const result = await loginParent(parsed);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.issues.map((issue) => issue.message).join("; ")
      });
    }
    return next(error);
  }
}

async function kidsLogin(req, res, next) {
  try {
    const parsed = kidLoginSchema.parse(req.body);
    const isoDob = parseDdMmYyyyToIsoDate(parsed.dateOfBirth);

    if (!isoDob) {
      return res.status(400).json({
        success: false,
        message: "dateOfBirth must be in dd/mm/yyyy format"
      });
    }

    const kid = await kidLogin({
      kidName: parsed.kidName,
      dateOfBirth: isoDob
    });

    return res.status(200).json({
      success: true,
      message: "Kid login successful",
      data: {
        kidId: kid.id,
        kidName: kid.kid_name,
        childType: kid.child_type,
        dateOfBirth: isoDateToDdMmYyyy(kid.date_of_birth),
        parent: {
          parentId: kid.parent_id,
          parentName: kid.parent_name,
          mobileNumber: kid.mobile_number
        }
      }
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.issues.map((issue) => issue.message).join("; ")
      });
    }
    return next(error);
  }
}

module.exports = {
  signIn,
  parentLogin,
  kidsLogin
};
